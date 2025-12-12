"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Loader2, Clock, CheckCircle2, XCircle } from "lucide-react";
import DatabaseQueryService, { QueryResult } from "@/services/database-query.service";
import { useToast } from "@/hooks/use-toast";

interface SQLQueryEditorProps {
  databaseId: string;
  databaseType?: string;
}

export function SQLQueryEditor({ databaseId, databaseType }: SQLQueryEditorProps) {
  const getInitialQuery = () => {
    switch (databaseType) {
      case "MYSQL":
      case "POSTGRESQL":
        return "SELECT * FROM ";
      case "MONGODB":
        return "db.collection.find({})";
      case "REDIS":
        return "GET key";
      default:
        return "";
    }
  };

  const [query, setQuery] = useState(getInitialQuery());
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const { toast } = useToast();

  const handleExecuteQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a query",
        variant: "destructive",
      });
      return;
    }

    setIsExecuting(true);
    try {
      const result = await DatabaseQueryService.executeQuery({
        databaseId,
        query: query.trim(),
      });

      setResult(result);

      if (result.message.toLowerCase().includes("error")) {
        toast({
          title: "Query Error",
          description: result.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Query Executed",
          description: result.message,
        });
      }
    } catch (error: any) {
      toast({
        title: "Execution Failed",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
      setResult(null);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+Enter or Cmd+Enter to execute
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleExecuteQuery();
    }
  };

  return (
    <div className="space-y-4">
      {/* Query Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {databaseType === "MONGODB" ? "MongoDB Query Editor" : 
                 databaseType === "REDIS" ? "Redis Command Editor" : 
                 "SQL Query Editor"}
              </CardTitle>
              <CardDescription>
                {databaseType === "MONGODB" ? "Write and execute MongoDB queries" :
                 databaseType === "REDIS" ? "Execute Redis commands" :
                 "Write and execute SQL queries (SELECT, INSERT, UPDATE, DELETE)"}
              </CardDescription>
            </div>
            <Button onClick={handleExecuteQuery} disabled={isExecuting}>
              {isExecuting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Execute (Ctrl+Enter)
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              databaseType === "MONGODB" 
                ? "Examples:\nshow collections\ndb.users.find({})\ndb.users.count()" 
                : databaseType === "REDIS"
                ? "Examples:\nKEYS *\nGET mykey\nHGETALL user:1\nINFO"
                : "Enter your SQL query here..."
            }
            className="font-mono min-h-[200px] text-sm"
            spellCheck={false}
          />
          <div className="mt-2 text-xs text-muted-foreground">
            Press <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd> to execute
          </div>
          
          {/* Example queries */}
          {databaseType === "MONGODB" && (
            <div className="mt-3 p-3 bg-muted/50 rounded text-xs space-y-1">
              <div className="font-semibold mb-2">Example MongoDB queries:</div>
              <div className="space-y-1 font-mono text-muted-foreground">
                <div>• <span className="text-foreground">show collections</span> - List all collections</div>
                <div>• <span className="text-foreground">db.collection.find(&#123;&#125;)</span> - Find all documents</div>
                <div>• <span className="text-foreground">db.collection.find(&#123;&quot;field&quot;: &quot;value&quot;&#125;)</span> - Find with filter</div>
                <div>• <span className="text-foreground">db.collection.count()</span> - Count documents</div>
                <div>• <span className="text-foreground">db.collection.aggregate([&#123;$match: &#123;&#125;&#125;])</span> - Aggregation pipeline</div>
                <div>• <span className="text-foreground">db.collection.createIndex(&#123;&quot;field&quot;: 1&#125;)</span> - Create index</div>
              </div>
            </div>
          )}
          
          {databaseType === "REDIS" && (
            <div className="mt-3 p-3 bg-muted/50 rounded text-xs space-y-1">
              <div className="font-semibold mb-2">Example Redis commands:</div>
              <div className="space-y-1 font-mono text-muted-foreground">
                <div className="mb-1 text-foreground font-semibold">String:</div>
                <div>• <span className="text-foreground">GET key</span> / <span className="text-foreground">SET key value</span> / <span className="text-foreground">MGET key1 key2</span></div>
                <div>• <span className="text-foreground">INCR counter</span> / <span className="text-foreground">DECR counter</span> / <span className="text-foreground">INCRBY key 10</span></div>
                <div className="mb-1 mt-2 text-foreground font-semibold">Hash:</div>
                <div>• <span className="text-foreground">HGETALL key</span> / <span className="text-foreground">HSET key field value</span></div>
                <div className="mb-1 mt-2 text-foreground font-semibold">List:</div>
                <div>• <span className="text-foreground">LPUSH list item</span> / <span className="text-foreground">LRANGE list 0 -1</span></div>
                <div className="mb-1 mt-2 text-foreground font-semibold">Set:</div>
                <div>• <span className="text-foreground">SADD set member</span> / <span className="text-foreground">SMEMBERS set</span></div>
                <div className="mb-1 mt-2 text-foreground font-semibold">Sorted Set:</div>
                <div>• <span className="text-foreground">ZADD zset 1 member</span> / <span className="text-foreground">ZRANGE zset 0 -1 WITHSCORES</span></div>
                <div className="mb-1 mt-2 text-foreground font-semibold">Other:</div>
                <div>• <span className="text-foreground">KEYS *</span> / <span className="text-foreground">TTL key</span> / <span className="text-foreground">INFO</span></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Query Results */}
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {result.message.toLowerCase().includes("error") ? (
                  <XCircle className="h-5 w-5 text-destructive" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                Results
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {result.executionTimeMs}ms
                </span>
                {result.rowCount !== undefined && (
                  <span>
                    {result.rowCount} {result.rowCount === 1 ? "row" : "rows"}
                  </span>
                )}
                {result.affectedRows !== undefined && (
                  <span>{result.affectedRows} affected</span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {result.queryType === "SELECT" && result.rows && result.rows.length > 0 ? (
              <div className="overflow-auto max-h-[500px]">
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      {result.columns.map((column) => (
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
                    {result.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-muted/50">
                        {result.columns.map((column) => (
                          <td
                            key={`${rowIndex}-${column}`}
                            className="border border-border px-4 py-2"
                          >
                            {row[column] === null ? (
                              <span className="text-muted-foreground italic">NULL</span>
                            ) : typeof row[column] === "object" ? (
                              <span className="font-mono text-xs">{JSON.stringify(row[column])}</span>
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
            ) : result.queryType === "SELECT" ? (
              <div className="text-center py-8 text-muted-foreground">
                Query returned no results
              </div>
            ) : (
              <div className="py-4">
                <p className="text-sm">{result.message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
