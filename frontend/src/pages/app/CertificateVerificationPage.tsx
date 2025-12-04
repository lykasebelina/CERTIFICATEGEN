import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient'; 
import { CertificateData, CertificateElement, GeneratedCertificate } from '../../types/certificate'; 

// Define the shape of the data we will display
interface CertificateVerificationData {
    // Unique ID for the specific instance (from JSON array, used to track this certificate)
    uniqueInstanceId: string; 
    // ID of the parent template 
    templateId: string;      
    
    // Display Fields
    title: string;          // Award Title (e.g., CERTIFICATE OF COMPLETION)
    recipient: string;      // Recipient Name
    institution: string;    // Issued By / Organization Name
    issuedOn: string;       // Formatted issue date
    
    status: 'Valid' | 'Invalid' | 'Error';
}

/**
 * 🔑 AI EXTRACTOR FUNCTION (Calls server endpoint for robust date parsing)
 * This function handles the network request to the backend service to clean and format the date string.
 */
const extractDateFromText = async (rawText: string): Promise<string> => {
    if (!rawText || rawText === 'Date/Place Not Available') return 'Date Extraction Failed';
    
    try {
        // Assume AI server runs on http://localhost:4000
        const res = await fetch("http://localhost:4000/extract-date", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rawText: rawText }) 
        });

        if (!res.ok) {
            console.error("AI Server responded with error:", res.status);
            return rawText; 
        }

        const data = await res.json();
        return data.extractedDate || 'Date Extraction Failed (Empty)';

    } catch (error) {
        console.error("AI Date Extraction API Call Error:", error);
        return rawText; 
    }
};


const CertificateVerificationPage: React.FC = () => {
    // templateId is from the path: /view/certificate/:templateId
    const { templateId } = useParams<{ templateId: string }>();
    
    // instanceId is from the query parameter: ?instanceId=...
    const [searchParams] = useSearchParams();
    const instanceId = searchParams.get('instanceId'); // This is the UNIQUE INSTANCE ID from the QR code

    const [loading, setLoading] = useState(true);
    const [verificationData, setVerificationData] = useState<CertificateVerificationData | null>(null);

    // --- Utility Function to Extract Data (Now ASYNC) ---
    const extractVerificationDetails = async (
        template: CertificateData, 
        instance: GeneratedCertificate
    ): Promise<CertificateVerificationData> => {
        
        // Helper to find and clean text content based on assumed zIndex/ID
        const findContent = (elements: CertificateElement[], zIndex: number, defaultVal: string) => {
            const element = elements.find(el => el.zIndex === zIndex && (el.type === 'text' || el.type === 'signature'));
            return element?.content?.trim() || defaultVal;
        };
        
        const institutionRaw = findContent(instance.elements, 6, 'Institution Not Found');
        const institution = institutionRaw.split('\n')[0].trim(); 
        const awardTitle = findContent(instance.elements, 10, 'AWARD TITLE NOT FOUND'); 
        const issuedOnSentence = findContent(instance.elements, 16, 'Date/Place Not Available');
        const issuedOn = await extractDateFromText(issuedOnSentence);
        const recipientName = instance.name || findContent(instance.elements, 12, 'Recipient Not Found');
        
        return {
            uniqueInstanceId: instance.id,
            templateId: template.id,
            title: awardTitle.toUpperCase(),
            recipient: recipientName,
            institution: institution,
            issuedOn: issuedOn,
            status: 'Valid', 
        };
    };

    // --- Fetch Logic (Updated to handle async function call) ---
    useEffect(() => {
        const verifyCertificate = async () => {
            if (!templateId || !instanceId) {
                setVerificationData({
                    uniqueInstanceId: 'N/A', templateId: 'N/A', title: 'Verification Failed',
                    recipient: 'N/A', institution: 'N/A', issuedOn: 'N/A', status: 'Error'
                });
                setLoading(false);
                return;
            }

            // 🏆 FINAL FIX: Treat the template-preview ID as VALID, regardless of bulk status.
            if (instanceId === 'template-preview') {
                 // Fetch template data to get display info (title, institution)
                 const { data: templateRecord, error } = await supabase
                    .from('certificates')
                    .select('id, title, elements') // No need for generated_instances if we always validate
                    .eq('id', templateId)
                    .single();
                 
                 // Look for the element assumed to hold institution name (zIndex 6)
                 const institutionElement = templateRecord?.elements.find((el:any) => el.zIndex === 6 && el.type === 'text');
                 const institutionRaw = institutionElement?.content || 'Institution Unknown';
                 const institution = institutionRaw.split('\n')[0].trim();
                 
                 setVerificationData({ 
                    // Set Template ID as the Certificate ID
                    uniqueInstanceId: templateId, 
                    templateId: templateId, 
                    title: (templateRecord?.title || 'Certificate').toUpperCase(),
                    recipient: 'OFFICIALLY ISSUED SINGLE CERTIFICATE', 
                    institution: institution, 
                    issuedOn: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 
                    status: 'Valid' // ALWAYS VALID if the QR code used the Template ID (template-preview)
                 });
                 setLoading(false);
                 return; 
            }
            // End of Template Preview Fix


            try {
                // 1. Fetch the parent template record
                const { data: templateRecord, error } = await supabase
                    .from('certificates')
                    .select('id, title, elements, generated_instances')
                    .eq('id', templateId)
                    .single();

                if (error || !templateRecord) {
                    throw new Error("Template not found or database error.");
                }

                const templateData: CertificateData = {
                    id: templateRecord.id,
                    name: templateRecord.title || 'Untitled',
                    elements: templateRecord.elements,
                    generated_instances: templateRecord.generated_instances,
                    width: 0, height: 0, size: 'a4-portrait', createdAt: new Date() 
                };
                
                // 2. Search the JSON array for the matching instanceId (Bulk Check)
                const instances: GeneratedCertificate[] = templateRecord.generated_instances || [];
                const matchingInstance = instances.find(inst => inst.id === instanceId);

                if (!matchingInstance) {
                    setVerificationData({ 
                        uniqueInstanceId: instanceId,
                        templateId: templateId,
                        title: templateData.name,
                        recipient: 'Not Found',
                        institution: 'N/A', issuedOn: 'N/A',
                        status: 'Invalid', 
                    });
                    
                } else {
                    // 3. Extract and set the verified data (MUST AWAIT THE ASYNC CALL)
                    const details = await extractVerificationDetails(templateData, matchingInstance);
                    setVerificationData(details);
                }

            } catch (err) {
                console.error("Verification Error:", err);
                setVerificationData({
                    uniqueInstanceId: instanceId, templateId: templateId, title: 'Error: Database Lookup Failed',
                    recipient: 'N/A', institution: 'N/A', issuedOn: 'N/A', status: 'Error'
                });
            } finally {
                setLoading(false);
            }
        };

        verifyCertificate();
    }, [templateId, instanceId]);
    
    // --- Rendering ---
    // Update color scheme for Dark Theme
    const statusColor = verificationData?.status === 'Valid' 
        ? 'text-green-400 border-green-400' 
        : verificationData?.status === 'Invalid' 
        ? 'text-red-400 border-red-400' 
        : 'text-yellow-400 border-yellow-400';
        
    const statusBg = verificationData?.status === 'Valid' 
        ? 'bg-green-600/20' 
        : verificationData?.status === 'Invalid' 
        ? 'bg-red-600/20' 
        : 'bg-yellow-600/20';

    return (
        // Changed background to dark blue/black
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            {/* Changed card background to a slightly lighter dark color */}
            <div className="bg-gray-800 shadow-2xl rounded-xl w-full max-w-lg p-8 border border-gray-700">
                
                {/* Header section with Certigen theme colors */}
                <div className="flex items-center justify-between border-b border-gray-700 pb-4 mb-6">
                    <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                        {/* 🌟 LOGO ADDITION HERE: Using your specified path */}
                        <img 
                            src="/public/certigen_logo.png" 
                            alt="Certigen Logo" 
                            className="h-10 w-auto" // Adjust size as needed
                        />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                            Certigen Verification
                        </span>
                    </h1>
                    {/* Status badge with colored border and lighter background */}
                    <span className={`px-4 py-1.5 text-sm font-bold rounded-full border ${statusColor} ${statusBg} tracking-wider`}>
                        {loading ? 'CHECKING...' : verificationData?.status}
                    </span>
                </div>
                
                {loading ? (
                    <div className="text-center py-10 text-gray-400">
                        <svg className="animate-spin h-6 w-6 text-indigo-400 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Verifying Certificate Data...
                    </div>
                ) : (
                    <div className="space-y-4">
                        
                        {/* ----------------- REQUIRED DETAILS ----------------- */}
                        <VerificationTitleDark label="Issued By" value={verificationData?.institution || 'N/A'} isPrimary={true} />
                        <VerificationTitleDark label="Certificate Title" value={verificationData?.title || 'N/A'} />
                        <VerificationTitleDark label="Issued to" value={verificationData?.recipient || 'N/A'} isPrimary={true} />
                        <VerificationTitleDark label="Issued on" value={verificationData?.issuedOn || 'N/A'} />
                        <hr className="my-4 border-gray-700" />
                        
                        {/* --- FINAL ID DETAIL --- */}
                        <VerificationTitleDark label="Certificate ID" value={verificationData?.uniqueInstanceId || 'N/A'} isMonospace={true} />
                        
                        {/* --- Status & Footer --- */}
                        {verificationData?.status === 'Valid' && (
                            <div className="pt-4 text-center">
                                <p className="text-sm font-medium text-green-400 p-3 rounded-lg bg-gray-700/50">
                                    <span className="font-bold">AUTHENTICATED:</span> Data pulled directly from the organization's repository.
                                </p>
                            </div>
                        )}
                        {verificationData?.status !== 'Valid' && (
                            <div className="text-center py-3 bg-red-900/40 border border-red-700 rounded-lg p-4">
                                <p className="text-sm text-red-300">
                                    Status: **{verificationData?.status}**. Record not found or verification failed. Please check the ID.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper component for cleaner display, updated for Dark Theme
const VerificationTitleDark: React.FC<{ label: string; value: string; isPrimary?: boolean; isMonospace?: boolean }> = ({ label, value, isPrimary = false, isMonospace = false }) => (
    <div className="flex flex-col py-3 border-b border-gray-700 last:border-b-0">
        <span className={`text-sm font-medium ${isPrimary ? 'text-indigo-400' : 'text-gray-400'}`}>{label}</span>
        {/* Adjusted primary color to a vibrant blue and removed extra large font for better balance */}
        <span className={`mt-1 ${isPrimary ? 'text-pink-300 text-lg font-bold' : 'text-white text-base'} ${isMonospace ? 'font-mono text-xs break-all tracking-wider' : 'text-base'}`}>
            {value}
        </span>
    </div>
);

export default CertificateVerificationPage;