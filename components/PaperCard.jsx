import Link from 'next/link';

export default function PaperCard({ paper }) {
  const chatUrl = `/tutor/chat/${paper._id}?university=${encodeURIComponent(paper.university)}&subject=${encodeURIComponent(paper.subject)}`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:border-blue-300 transition">
      <div>
        <h3 className="font-semibold text-gray-900 text-sm">{paper.subject}</h3>
        <p className="text-gray-400 text-xs mt-0.5">{paper.university}</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            Year {paper.year}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            Sem {paper.semester}
          </span>
          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
            {paper.totalChunks} chunks indexed
          </span>
        </div>
      </div>
      <Link
        href={chatUrl}
        className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition flex-shrink-0"
      >
        Chat
      </Link>
    </div>
  );
}