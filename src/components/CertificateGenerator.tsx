import { Award, Download, Share2 } from 'lucide-react';

interface CertificateGeneratorProps {
  courseName: string;
  studentName: string;
  completionDate: string;
  onClose: () => void;
}

export default function CertificateGenerator({
  courseName,
  studentName,
  completionDate,
  onClose,
}: CertificateGeneratorProps) {
  const handleDownload = () => {
    // TODO: Implement PDF generation
    alert('Certificate download will be implemented');
  };

  const handleShare = () => {
    // TODO: Implement sharing
    alert('Certificate sharing will be implemented');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full p-8">
        {/* Certificate Preview */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-12 mb-6 border-4 border-double border-blue-300 dark:border-blue-700">
          <div className="text-center">
            <Award className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Certificate of Completion
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              This is to certify that
            </p>
            <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-8">
              {studentName}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
              has successfully completed the course
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
              {courseName}
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Completed on {new Date(completionDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            Close
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
