import React, { useRef, useEffect, useState, RefObject } from 'react';
import { X, Globe, Lock, Link, Check, Clipboard } from 'lucide-react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentId: string;
    certificateTitle: string | null;
}

export const ShareModal = ({ isOpen, onClose, documentId, certificateTitle }: ShareModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);
    // ⭐️ Public link points to the Viewer: /view/certificate/:certId ⭐️
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
    const publicLink = `${origin}/view/certificate/${documentId}`; 

    const [isPublicLinkEnabled, setIsPublicLinkEnabled] = useState(true);
    const [copyStatus, setCopyStatus] = useState('');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    const handleCopy = () => {
        if (isPublicLinkEnabled) {
            navigator.clipboard.writeText(publicLink).then(() => setCopyStatus('Copied!'));
            setTimeout(() => setCopyStatus(''), 2000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <div ref={modalRef as RefObject<HTMLDivElement>} className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Share: {certificateTitle || 'Untitled'}</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"><X size={20} /></button>
                </div>
                <div className="p-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            {isPublicLinkEnabled ? <Globe className="text-green-500" size={18} /> : <Lock className="text-red-500" size={18} />}
                            <h4 className="font-medium text-gray-700 dark:text-gray-200">Public View Link</h4>
                        </div>
                        <button onClick={() => setIsPublicLinkEnabled(!isPublicLinkEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublicLinkEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublicLinkEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <Link size={16} className="text-gray-500 mr-2 flex-shrink-0" />
                            <input type="text" readOnly value={publicLink} className="flex-1 bg-transparent text-sm truncate focus:outline-none dark:text-gray-200" />
                        </div>
                        <button onClick={handleCopy} disabled={!isPublicLinkEnabled} className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50">
                            {copyStatus === 'Copied!' ? <><Check size={16} className="mr-2" />Copied!</> : <><Clipboard size={16} className="mr-2" />Copy Link</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};