
import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface VirtualTableProps {
  data: any[];
  columns: {
    key: string;
    header: string;
    width: number;
    render?: (item: any) => React.ReactNode;
  }[];
  height: number;
  rowHeight?: number;
  onRowClick?: (item: any) => void;
}

const VirtualTable: React.FC<VirtualTableProps> = ({
  data,
  columns,
  height,
  rowHeight = 50,
  onRowClick
}) => {
  const totalWidth = useMemo(() => 
    columns.reduce((sum, col) => sum + col.width, 0), 
    [columns]
  );

  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = data[index];
    
    return (
      <div style={style}>
        <TableRow 
          key={index}
          className="cursor-pointer hover:bg-muted/50"
          onClick={() => onRowClick?.(item)}
        >
          {columns.map((column) => (
            <TableCell key={column.key} style={{ width: column.width }}>
              {column.render ? column.render(item) : item[column.key]}
            </TableCell>
          ))}
        </TableRow>
      </div>
    );
  }, [data, columns, onRowClick]);

  const memoizedColumns = useMemo(() => columns, [columns]);

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            {memoizedColumns.map((column) => (
              <TableHead key={column.key} style={{ width: column.width }}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      </Table>
      <div style={{ height }}>
        <List
          height={height}
          width={totalWidth}
          itemCount={data.length}
          itemSize={rowHeight}
          itemData={data}
        >
          {Row}
        </List>
      </div>
    </div>
  );
};

export default VirtualTable;
