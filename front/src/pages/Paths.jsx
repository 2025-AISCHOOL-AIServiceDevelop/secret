import { useEffect } from 'react';
import { useContentsStore } from '../stores';

function Paths() {
  const { contents, isLoading, error, loadContents } = useContentsStore();

  useEffect(() => {
    loadContents();
  }, [loadContents]);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Contents Paths</h2>

      {error && (
        <div className="mb-3 text-red-600 font-semibold">{error}</div>
      )}

      {isLoading ? (
        <div>로딩 중...</div>
      ) : (
        <div className="overflow-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left border-b">contentsId</th>
                <th className="px-3 py-2 text-left border-b">title</th>
                <th className="px-3 py-2 text-left border-b">language</th>
                <th className="px-3 py-2 text-left border-b">thumbUrl</th>
                <th className="px-3 py-2 text-left border-b">contentsPath</th>
              </tr>
            </thead>
            <tbody>
              {contents.map(item => (
                <tr key={item.contentsId} className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2 border-b whitespace-nowrap">{item.contentsId}</td>
                  <td className="px-3 py-2 border-b">{item.title}</td>
                  <td className="px-3 py-2 border-b whitespace-nowrap">{item.language}</td>
                  <td className="px-3 py-2 border-b">
                    <a
                      href={item.thumbUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline break-all"
                    >
                      {item.thumbUrl}
                    </a>
                  </td>
                  <td className="px-3 py-2 border-b">
                    <span className="font-mono break-all">{item.contentsPath || ''}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Paths;




