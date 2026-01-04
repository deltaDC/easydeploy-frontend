"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [showLightBeam, setShowLightBeam] = useState(false);
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
    // Trigger light beam sweep
    setShowLightBeam(true);
    setTimeout(() => setShowLightBeam(false), 800);
    
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
    <div className="space-y-4 p-6 relative">
      {/* Light beam sweep effect when executing */}
      <AnimatePresence>
        {showLightBeam && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: "200%", opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(236, 72, 153, 0.4) 50%, transparent 100%)",
              height: "100%",
            }}
          />
        )}
      </AnimatePresence>

      {/* Query Editor */}
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white/90">
              {databaseType === "MONGODB" ? "MongoDB Query Editor" : 
               databaseType === "REDIS" ? "Redis Command Editor" : 
               "SQL Query Editor"}
            </h3>
            <p className="text-sm text-white/60 mt-1">
              {databaseType === "MONGODB" ? "Write and execute MongoDB queries" :
               databaseType === "REDIS" ? "Execute Redis commands" :
               "Write and execute SQL queries (SELECT, INSERT, UPDATE, DELETE)"}
            </p>
          </div>
          {/* Execute button: Play triangle in glowing circle */}
          <motion.button
            onClick={handleExecuteQuery}
            disabled={isExecuting}
            className="relative w-14 h-14 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "rgba(236, 72, 153, 0.8)",
              boxShadow: "0 0 30px rgba(236, 72, 153, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)",
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isExecuting ? (
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            ) : (
              <Play className="h-6 w-6 text-white ml-1" fill="white" />
            )}
            {/* Glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: "0 0 20px rgba(236, 72, 153, 0.8)",
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.button>
        </div>
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
          className="font-mono min-h-[200px] text-sm bg-transparent border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-pink-500/50"
          style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            color: "#EC4899", // Pink for keywords (will be enhanced with syntax highlighting)
          }}
          spellCheck={false}
        />
        <div className="mt-2 text-xs text-white/50">
          Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-white/70">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-white/10 rounded text-white/70">Enter</kbd> to execute
        </div>
        
        {/* Example queries */}
        {databaseType === "MONGODB" && (
          <div className="mt-3 p-3 bg-white/10 rounded text-xs space-y-1">
            <div className="font-semibold mb-2 text-white/80">Example MongoDB queries:</div>
            <div className="space-y-1 font-mono text-white/60">
              <div>• <span className="text-white/90">show collections</span> - List all collections</div>
              <div>• <span className="text-white/90">db.collection.find(&#123;&#125;)</span> - Find all documents</div>
              <div>• <span className="text-white/90">db.collection.find(&#123;&quot;field&quot;: &quot;value&quot;&#125;)</span> - Find with filter</div>
              <div>• <span className="text-white/90">db.collection.count()</span> - Count documents</div>
              <div>• <span className="text-white/90">db.collection.aggregate([&#123;$match: &#123;&#125;&#125;])</span> - Aggregation pipeline</div>
              <div>• <span className="text-white/90">db.collection.createIndex(&#123;&quot;field&quot;: 1&#125;)</span> - Create index</div>
            </div>
          </div>
        )}
        
        {databaseType === "REDIS" && (
          <div className="mt-3 p-3 bg-white/10 rounded text-xs space-y-1">
            <div className="font-semibold mb-2 text-white/80">Example Redis commands:</div>
            <div className="space-y-1 font-mono text-white/60">
              <div className="mb-1 text-white/90 font-semibold">String:</div>
              <div>• <span className="text-white/90">GET key</span> / <span className="text-white/90">SET key value</span> / <span className="text-white/90">MGET key1 key2</span></div>
              <div>• <span className="text-white/90">INCR counter</span> / <span className="text-white/90">DECR counter</span> / <span className="text-white/90">INCRBY key 10</span></div>
              <div className="mb-1 mt-2 text-white/90 font-semibold">Hash:</div>
              <div>• <span className="text-white/90">HGETALL key</span> / <span className="text-white/90">HSET key field value</span></div>
              <div className="mb-1 mt-2 text-white/90 font-semibold">List:</div>
              <div>• <span className="text-white/90">LPUSH list item</span> / <span className="text-white/90">LRANGE list 0 -1</span></div>
              <div className="mb-1 mt-2 text-white/90 font-semibold">Set:</div>
              <div>• <span className="text-white/90">SADD set member</span> / <span className="text-white/90">SMEMBERS set</span></div>
              <div className="mb-1 mt-2 text-white/90 font-semibold">Sorted Set:</div>
              <div>• <span className="text-white/90">ZADD zset 1 member</span> / <span className="text-white/90">ZRANGE zset 0 -1 WITHSCORES</span></div>
              <div className="mb-1 mt-2 text-white/90 font-semibold">Other:</div>
              <div>• <span className="text-white/90">KEYS *</span> / <span className="text-white/90">TTL key</span> / <span className="text-white/90">INFO</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Query Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.45)",
            backdropFilter: "blur(25px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-charcoal flex items-center gap-2">
                {result.message.toLowerCase().includes("error") ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                )}
                Results
              </h3>
              <div className="flex items-center gap-4 text-sm text-charcoal/60">
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
            {result.queryType === "SELECT" && result.rows && result.rows.length > 0 ? (
              <div className="overflow-auto max-h-[500px] rounded-xl">
                <table className="w-full border-collapse text-sm">
                  {/* Sticky header with glass background */}
                  <thead className="sticky top-0 z-10">
                    <tr>
                      {result.columns.map((column, colIndex) => (
                        <motion.th
                          key={column}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: colIndex * 0.05 }}
                          className="px-4 py-3 text-left font-semibold text-charcoal border-b border-charcoal/20"
                          style={{
                            background: "rgba(255, 255, 255, 0.6)",
                            backdropFilter: "blur(10px)",
                          }}
                        >
                          {column}
                        </motion.th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, rowIndex) => (
                      <motion.tr
                        key={rowIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: rowIndex * 0.03 }}
                        className="hover:bg-white/30 border-b border-charcoal/10"
                      >
                        {result.columns.map((column) => (
                          <td
                            key={`${rowIndex}-${column}`}
                            className="px-4 py-3 text-charcoal/80"
                          >
                            {row[column] === null ? (
                              <span className="text-charcoal/40 italic">NULL</span>
                            ) : typeof row[column] === "object" ? (
                              <span className="font-mono text-xs text-charcoal/60">{JSON.stringify(row[column])}</span>
                            ) : (
                              String(row[column])
                            )}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : result.queryType === "SELECT" ? (
              <div className="text-center py-8 text-charcoal/60">
                Query returned no results
              </div>
            ) : (
              <div className="py-4">
                <p className="text-sm text-charcoal">{result.message}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
