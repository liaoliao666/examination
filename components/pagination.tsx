import { TableInstance } from "@tanstack/react-table";

export default function Pagination({
  instance,
}: {
  instance: TableInstance<any>;
}) {
  return (
    <div className="flex items-center py-4 justify-end gap-2">
      <button
        className="btn"
        onClick={() => instance.setPageIndex(0)}
        disabled={!instance.getCanPreviousPage()}
      >
        {"<<"}
      </button>
      <button
        className="btn"
        onClick={() => instance.previousPage()}
        disabled={!instance.getCanPreviousPage()}
      >
        {"<"}
      </button>
      <button
        className="btn"
        onClick={() => instance.nextPage()}
        disabled={!instance.getCanNextPage()}
      >
        {">"}
      </button>
      <button
        className="btn"
        onClick={() => instance.setPageIndex(instance.getPageCount() - 1)}
        disabled={!instance.getCanNextPage()}
      >
        {">>"}
      </button>

      <span className="flex items-center gap-1">
        <div>第</div>
        <strong>{instance.getState().pagination.pageIndex + 1} 页</strong>
      </span>
      <span className="flex items-center gap-1">
        <div>共</div>
        <strong>{instance.getPageCount()}</strong> 页
      </span>
      <span className="flex items-center gap-1">
        | 跳至:
        <input
          type="number"
          defaultValue={instance.getState().pagination.pageIndex + 1}
          onChange={(e) => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0;
            instance.setPageIndex(page);
          }}
          className="input input-bordered input-sm w-20"
          min={1}
          max={instance.getPageCount()}
        />
        页
      </span>
      <select
        value={instance.getState().pagination.pageSize}
        onChange={(e) => {
          instance.setPageSize(Number(e.target.value));
        }}
        className="select select-bordered select-sm"
      >
        {[10, 20, 30, 40, 50].map((pageSize) => (
          <option key={pageSize} value={pageSize}>
            {pageSize} 条/页
          </option>
        ))}
      </select>
    </div>
  );
}
