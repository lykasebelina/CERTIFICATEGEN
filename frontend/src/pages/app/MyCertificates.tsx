import { Award, Download, Eye, Trash2 } from "lucide-react";

interface Certificate {
  id: string;
  recipientName: string;
  title: string;
  createdAt: string;
  thumbnail: string;
}

function MyCertificates() {
  const mockCertificates: Certificate[] = [
    { id: "1", recipientName: "Marceline Anderson", title: "Certificate of Appreciation", createdAt: "July 15, 2024", thumbnail: "sample1" },
    { id: "2", recipientName: "John Smith", title: "Certificate of Achievement", createdAt: "July 10, 2024", thumbnail: "sample2" },
    { id: "3", recipientName: "Sarah Johnson", title: "Certificate of Excellence", createdAt: "July 5, 2024", thumbnail: "sample3" },
    { id: "4", recipientName: "David Lee", title: "Employee of the Month", createdAt: "June 28, 2024", thumbnail: "sample4" },
    { id: "5", recipientName: "Emma Davis", title: "Outstanding Performance", createdAt: "June 22, 2024", thumbnail: "sample5" },
    { id: "6", recipientName: "Michael Brown", title: "Leadership Award", createdAt: "June 15, 2024", thumbnail: "sample6" },
    { id: "7", recipientName: "Olivia Taylor", title: "Certificate of Completion", createdAt: "June 10, 2024", thumbnail: "sample7" },
    { id: "8", recipientName: "Liam Wilson", title: "Top Performer", createdAt: "June 5, 2024", thumbnail: "sample8" },
  ];

  return (
    <div className="h-full bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Certificates</h1>
            <p className="text-slate-400 text-sm">
              View, manage, and download your AI-generated certificates
            </p>
          </div>
          <Award className="w-10 h-10 text-blue-400" />
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockCertificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500 transition-all group hover:shadow-lg hover:scale-[1.02]"
            >
              {/* Thumbnail */}
              <div className="aspect-[14/8.5] bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center border-b border-slate-700">
                <Award className="w-16 h-16 text-white opacity-90 group-hover:scale-110 transition-transform duration-200" />
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-white font-semibold mb-1 truncate">{cert.title}</h3>
                <p className="text-slate-400 text-sm mb-1 truncate">{cert.recipientName}</p>
                <p className="text-slate-500 text-xs mb-4">{cert.createdAt}</p>

                {/* Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {mockCertificates.length === 0 && (
          <div className="text-center py-16">
            <Award className="w-24 h-24 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl text-slate-300 mb-2">No certificates yet</h3>
            <p className="text-slate-400 mb-6">
              Start creating beautiful certificates with AI
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Create Certificate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCertificates;
