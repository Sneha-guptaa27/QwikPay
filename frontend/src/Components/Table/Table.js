const Table = ({ columns, data, footer }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-[#F9F3EF] border-b border-[#456882]">
            {columns.map(col => (
              <th
                key={col.key}
                className="px-4 py-3 text-left font-semibold text-[#1B3C53]"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr
              key={row._id || i}
              className={`border-t border-[#456882] ${
                i % 2 ? "bg-[#F9F3EF]" : "bg-white"
              }`}
            >
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>

        {footer && (
          <tfoot>
            <tr className="bg-[#F9F3EF] border-t border-[#456882]">
              {footer}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};

export default Table;
