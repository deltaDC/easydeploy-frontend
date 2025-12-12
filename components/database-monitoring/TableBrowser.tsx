"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table as TableIcon,
  ChevronRight,
  ChevronDown,
  Key,
  Database,
  Loader2,
  RefreshCw,
} from "lucide-react";
import DatabaseQueryService, { TableSchema, QueryResult } from "@/services/database-query.service";
import { useToast } from "@/hooks/use-toast";

interface TableBrowserProps {
  databaseId: string;
}

export function TableBrowser({ databaseId }: TableBrowserProps) {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableSchema, setTableSchema] = useState<TableSchema | null>(null);
  const [tableData, setTableData] = useState<QueryResult | null>(null);
  const [isLoadingTables, setIsLoadingTables] = useState(true);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(50);
  const { toast } = useToast();

  const loadTables = useCallback(async () => {
    setIsLoadingTables(true);
    try {
      const tableList = await DatabaseQueryService.getTables(databaseId);
      setTables(tableList);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load tables",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTables(false);
    }
  }, [databaseId, toast]);

  const loadTableSchema = useCallback(async () => {
    if (!selectedTable) return;

    setIsLoadingSchema(true);
    try {
      const schema = await DatabaseQueryService.getTableSchema(databaseId, selectedTable);
      setTableSchema(schema);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load table schema",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSchema(false);
    }
  }, [databaseId, selectedTable, toast]);

  const loadTableData = useCallback(async (page: number) => {
    if (!selectedTable) return;

    setIsLoadingData(true);
    try {
      const data = await DatabaseQueryService.browseTableData(
        databaseId,
        selectedTable,
        pageSize,
        page * pageSize
      );
      setTableData(data);
      setCurrentPage(page);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load table data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  }, [databaseId, selectedTable, pageSize, toast]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  useEffect(() => {
    if (selectedTable) {
      loadTableSchema();
      loadTableData(0);
    }
  }, [selectedTable, loadTableSchema, loadTableData]);

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName === selectedTable ? null : tableName);
    setCurrentPage(0);
  };

  const handleRefresh = () => {
    loadTables();
    if (selectedTable) {
      loadTableSchema();
      loadTableData(currentPage);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Tables List */}
      <div className="col-span-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4" />
                Tables ({tables.length})
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingTables ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : tables.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No tables found</p>
            ) : (
              <div className="space-y-1">
                {tables.map((table) => (
                  <button
                    key={table}
                    onClick={() => handleTableSelect(table)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedTable === table
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {selectedTable === table ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
                    )}
                    <TableIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{table}</span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Table Details */}
      <div className="col-span-9">
        {!selectedTable ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Select a table to view its details</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Schema */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Schema: {selectedTable}</CardTitle>
                {tableSchema && (
                  <CardDescription>{tableSchema.rowCount} rows</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {isLoadingSchema ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : tableSchema ? (
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3 font-semibold">Column</th>
                          <th className="text-left py-2 px-3 font-semibold">Type</th>
                          <th className="text-left py-2 px-3 font-semibold">Nullable</th>
                          <th className="text-left py-2 px-3 font-semibold">Default</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableSchema.columns.map((column) => (
                          <tr key={column.name} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2">
                                {column.primaryKey && <Key className="h-3 w-3 text-amber-500" />}
                                <span className="font-mono">{column.name}</span>
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <Badge variant="outline" className="text-xs">
                                {column.type}
                              </Badge>
                            </td>
                            <td className="py-2 px-3">
                              {column.nullable ? (
                                <span className="text-muted-foreground">YES</span>
                              ) : (
                                <span className="text-destructive">NO</span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-mono text-xs">
                              {column.defaultValue || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Data */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Data</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadTableData(currentPage - 1)}
                      disabled={currentPage === 0 || isLoadingData}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage + 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadTableData(currentPage + 1)}
                      disabled={
                        isLoadingData ||
                        !tableData ||
                        tableData.rowCount < pageSize
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : tableData && tableData.rows.length > 0 ? (
                  <div className="overflow-auto max-h-[400px]">
                    <table className="w-full border-collapse text-sm">
                      <thead className="sticky top-0 bg-muted">
                        <tr>
                          {tableData.columns.map((column) => (
                            <th
                              key={column}
                              className="border border-border px-4 py-2 text-left font-semibold"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.rows.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-muted/50">
                            {tableData.columns.map((column) => (
                              <td
                                key={`${rowIndex}-${column}`}
                                className="border border-border px-4 py-2"
                              >
                                {row[column] === null ? (
                                  <span className="text-muted-foreground italic">NULL</span>
                                ) : typeof row[column] === "object" ? (
                                  <span className="font-mono text-xs">
                                    {JSON.stringify(row[column])}
                                  </span>
                                ) : (
                                  String(row[column])
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No data</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
