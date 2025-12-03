"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Info, AlertCircle, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import DatabaseService from "@/services/database.service";
import { Database as DatabaseType, DatabaseStatus } from "@/types/database.type";

import { EnvironmentVariable } from "@/types/application.type";

interface DatabaseConfigSectionProps {
  databaseSource: 'none' | 'managed' | 'external' | 'existing';
  onDatabaseSourceChange: (source: 'none' | 'managed' | 'external' | 'existing') => void;
  dbType: 'postgres' | 'mysql' | 'mongodb' | 'redis' | 'other';
  onDbTypeChange: (type: 'postgres' | 'mysql' | 'mongodb' | 'redis' | 'other') => void;
  dbName: string;
  onDbNameChange: (name: string) => void;
  dbUsername: string;
  onDbUsernameChange: (username: string) => void;
  dbPassword: string;
  onDbPasswordChange: (password: string) => void;
  externalHost: string;
  onExternalHostChange: (host: string) => void;
  selectedDatabaseId?: string;
  onSelectedDatabaseIdChange: (databaseId: string | undefined) => void;
  envVars?: EnvironmentVariable[];
  onEnvVarsChange?: (envVars: EnvironmentVariable[]) => void;
}

export function DatabaseConfigSection({
  databaseSource,
  onDatabaseSourceChange,
  dbType,
  onDbTypeChange,
  dbName,
  onDbNameChange,
  dbUsername,
  onDbUsernameChange,
  dbPassword,
  onDbPasswordChange,
  externalHost,
  onExternalHostChange,
  selectedDatabaseId,
  onSelectedDatabaseIdChange,
  envVars = [],
  onEnvVarsChange,
}: DatabaseConfigSectionProps) {
  const [databases, setDatabases] = useState<DatabaseType[]>([]);
  const [loadingDatabases, setLoadingDatabases] = useState(false);
  const [loadingConnectionInfo, setLoadingConnectionInfo] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseType | null>(null);

  useEffect(() => {
    if (databaseSource === 'existing') {
      fetchDatabases();
    }
  }, [databaseSource]);

  useEffect(() => {
    if (selectedDatabaseId && databases.length > 0) {
      const db = databases.find(d => d.id === selectedDatabaseId);
      setSelectedDatabase(db || null);
    } else {
      setSelectedDatabase(null);
    }
  }, [selectedDatabaseId, databases]);

  const fetchDatabases = async () => {
    try {
      setLoadingDatabases(true);
      const data = await DatabaseService.getDatabases();
      setDatabases(data);
    } catch (error) {
      console.error('Failed to fetch databases:', error);
    } finally {
      setLoadingDatabases(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'POSTGRESQL': 'PostgreSQL',
      'MYSQL': 'MySQL',
      'MONGODB': 'MongoDB',
      'REDIS': 'Redis',
    };
    return labels[type] || type;
  };

  const runningDatabases = databases.filter(db => db.status === DatabaseStatus.RUNNING);
  const stoppedDatabases = databases.filter(db => db.status === DatabaseStatus.STOPPED);

  const handleDatabaseSelect = async (databaseId: string) => {
    onSelectedDatabaseIdChange(databaseId);
    const db = databases.find(d => d.id === databaseId);
    setSelectedDatabase(db || null);
    
    // Reset other database config fields when selecting existing database
    if (db) {
      onDbNameChange('');
      onDbUsernameChange('');
      onDbPasswordChange('');
      
      if (onEnvVarsChange && db.host && db.port && db.databaseName) {
        setLoadingConnectionInfo(true);
        try {
          const connectionInfo = await DatabaseService.getConnectionInfo(databaseId);
          
          const filteredEnvVars = envVars.filter(env => 
            !env.key.match(/^(DATABASE_URL|DATABASE_USERNAME|DATABASE_PASSWORD|SPRING_DATASOURCE_URL|SPRING_DATASOURCE_USERNAME|SPRING_DATASOURCE_PASSWORD|MONGO_URI|REDIS_URL|REDIS_HOST|REDIS_PORT|REDIS_PASSWORD|POSTGRES_HOST|POSTGRES_PORT|POSTGRES_USERNAME|POSTGRES_PASSWORD|POSTGRES_DATABASE|MYSQL_HOST|MYSQL_PORT|MYSQL_USERNAME|MYSQL_PASSWORD|MYSQL_DATABASE|MONGODB_HOST|MONGODB_PORT|MONGODB_USERNAME|MONGODB_PASSWORD|MONGODB_DATABASE)$/i)
          );
          
          const newEnvVars: EnvironmentVariable[] = [...filteredEnvVars];
          const host = connectionInfo.host || db.host || 'host.docker.internal';
          const port = connectionInfo.port || db.port;
          const databaseName = connectionInfo.databaseName || db.databaseName || '';
          const username = connectionInfo.username || '';
          const password = connectionInfo.password || '';
          
          if (db.type === 'POSTGRESQL') {
            newEnvVars.push(
              { key: 'DATABASE_URL', value: `postgresql://${username}:${password}@${host}:${port}/${databaseName}` },
              { key: 'DATABASE_USERNAME', value: username },
              { key: 'DATABASE_PASSWORD', value: password },
              { key: 'SPRING_DATASOURCE_URL', value: `jdbc:postgresql://${host}:${port}/${databaseName}` },
              { key: 'SPRING_DATASOURCE_USERNAME', value: username },
              { key: 'SPRING_DATASOURCE_PASSWORD', value: password },
              { key: 'POSTGRES_HOST', value: host },
              { key: 'POSTGRES_PORT', value: String(port) },
              { key: 'POSTGRES_USERNAME', value: username },
              { key: 'POSTGRES_PASSWORD', value: password },
              { key: 'POSTGRES_DATABASE', value: databaseName }
            );
          } else if (db.type === 'MYSQL') {
            newEnvVars.push(
              { key: 'DATABASE_URL', value: `mysql://${username}:${password}@${host}:${port}/${databaseName}` },
              { key: 'DATABASE_USERNAME', value: username },
              { key: 'DATABASE_PASSWORD', value: password },
              { key: 'SPRING_DATASOURCE_URL', value: `jdbc:mysql://${host}:${port}/${databaseName}?useSSL=false&allowPublicKeyRetrieval=true` },
              { key: 'SPRING_DATASOURCE_USERNAME', value: username },
              { key: 'SPRING_DATASOURCE_PASSWORD', value: password },
              { key: 'MYSQL_HOST', value: host },
              { key: 'MYSQL_PORT', value: String(port) },
              { key: 'MYSQL_USERNAME', value: username },
              { key: 'MYSQL_PASSWORD', value: password },
              { key: 'MYSQL_DATABASE', value: databaseName }
            );
          } else if (db.type === 'MONGODB') {
            newEnvVars.push(
              { key: 'DATABASE_URL', value: `mongodb://${username}:${password}@${host}:${port}/${databaseName}?authSource=admin` },
              { key: 'MONGO_URI', value: `mongodb://${username}:${password}@${host}:${port}/${databaseName}?authSource=admin` },
              { key: 'MONGODB_HOST', value: host },
              { key: 'MONGODB_PORT', value: String(port) },
              { key: 'MONGODB_USERNAME', value: username },
              { key: 'MONGODB_PASSWORD', value: password },
              { key: 'MONGODB_DATABASE', value: databaseName }
            );
          } else if (db.type === 'REDIS') {
            newEnvVars.push(
              { key: 'REDIS_URL', value: `redis://:${password}@${host}:${port}` },
              { key: 'REDIS_HOST', value: host },
              { key: 'REDIS_PORT', value: String(port) },
              { key: 'REDIS_PASSWORD', value: password }
            );
          }
          
          onEnvVarsChange(newEnvVars);
        } catch (error) {
          console.error('Failed to get connection info:', error);
          if (onEnvVarsChange) {
            const filteredEnvVars = envVars.filter(env => 
              !env.key.match(/^(DATABASE_URL|DATABASE_USERNAME|DATABASE_PASSWORD|SPRING_DATASOURCE_URL|SPRING_DATASOURCE_USERNAME|SPRING_DATASOURCE_PASSWORD|MONGO_URI|REDIS_URL|REDIS_HOST|REDIS_PORT|REDIS_PASSWORD|POSTGRES_HOST|POSTGRES_PORT|POSTGRES_USERNAME|POSTGRES_PASSWORD|POSTGRES_DATABASE|MYSQL_HOST|MYSQL_PORT|MYSQL_USERNAME|MYSQL_PASSWORD|MYSQL_DATABASE|MONGODB_HOST|MONGODB_PORT|MONGODB_USERNAME|MONGODB_PASSWORD|MONGODB_DATABASE)$/i)
            );
            const host = db.host || 'host.docker.internal';
            const port = db.port || 5432;
            const databaseName = db.databaseName || '';
            
            const newEnvVars: EnvironmentVariable[] = [...filteredEnvVars];
            if (db.type === 'POSTGRESQL') {
              newEnvVars.push(
                { key: 'POSTGRES_HOST', value: host },
                { key: 'POSTGRES_PORT', value: String(port) },
                { key: 'POSTGRES_DATABASE', value: databaseName }
              );
            } else if (db.type === 'MYSQL') {
              newEnvVars.push(
                { key: 'MYSQL_HOST', value: host },
                { key: 'MYSQL_PORT', value: String(port) },
                { key: 'MYSQL_DATABASE', value: databaseName }
              );
            } else if (db.type === 'MONGODB') {
              newEnvVars.push(
                { key: 'MONGODB_HOST', value: host },
                { key: 'MONGODB_PORT', value: String(port) },
                { key: 'MONGODB_DATABASE', value: databaseName }
              );
            }
            onEnvVarsChange(newEnvVars);
          }
        } finally {
          setLoadingConnectionInfo(false);
        }
      }
    }
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <CardTitle>Database Configuration</CardTitle>
        </div>
        <CardDescription>
          Choose to use a platform-managed database or connect your own external database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label>Database Option</Label>
          <RadioGroup value={databaseSource} onValueChange={(value: string) => {
            onDatabaseSourceChange(value as 'none' | 'managed' | 'external' | 'existing');
            if (value !== 'existing') {
              onSelectedDatabaseIdChange(undefined);
              setSelectedDatabase(null);
            }
          }}>
            <div className="flex items-center space-x-2 py-2">
              <RadioGroupItem value="none" id="db-none" />
              <Label htmlFor="db-none" className="font-normal cursor-pointer">
                No Database
              </Label>
            </div>
            <div className="flex items-center space-x-2 py-2">
              <RadioGroupItem value="existing" id="db-existing" />
              <Label htmlFor="db-existing" className="font-normal cursor-pointer">
                Use Existing Deployed Database
                <span className="text-muted-foreground text-sm ml-2">
                  (Select from your deployed databases)
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 py-2">
              <RadioGroupItem value="managed" id="db-managed" />
              <Label htmlFor="db-managed" className="font-normal cursor-pointer">
                Create New Platform Database
                <span className="text-muted-foreground text-sm ml-2">
                  (PostgreSQL, MySQL, MongoDB, Redis)
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 py-2">
              <RadioGroupItem value="external" id="db-external" />
              <Label htmlFor="db-external" className="font-normal cursor-pointer">
                Connect External Database
                <span className="text-muted-foreground text-sm ml-2">
                  (AWS RDS, Azure Database, etc.)
                </span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {databaseSource === 'existing' && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="existing-db">Select Database *</Label>
              {loadingDatabases ? (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading databases...</span>
                </div>
              ) : loadingConnectionInfo ? (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading connection info...</span>
                </div>
              ) : databases.length === 0 ? (
                <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                    No databases found. Please deploy a database first.
                  </AlertDescription>
                </Alert>
              ) : (
                <Select
                  value={selectedDatabaseId || ''}
                  onValueChange={handleDatabaseSelect}
                >
                  <SelectTrigger id="existing-db">
                    <SelectValue placeholder="Select a database" />
                  </SelectTrigger>
                  <SelectContent>
                    {runningDatabases.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          Running Databases
                        </div>
                        {runningDatabases.map((db) => (
                          <SelectItem key={db.id} value={db.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{db.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {getTypeLabel(db.type)} {db.version}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                    {stoppedDatabases.length > 0 && (
                      <>
                        {runningDatabases.length > 0 && <Separator className="my-1" />}
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          Stopped Databases
                        </div>
                        {stoppedDatabases.map((db) => (
                          <SelectItem key={db.id} value={db.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{db.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {getTypeLabel(db.type)} {db.version} (Stopped)
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedDatabase && selectedDatabase.status === DatabaseStatus.STOPPED && (
              <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <strong>Database sẽ tự động được khởi động:</strong>
                  <br />
                  Database &quot;{selectedDatabase.name}&quot; hiện đang dừng. Khi bạn deploy application, database này sẽ tự động được khởi động lại để application có thể kết nối.
                </AlertDescription>
              </Alert>
            )}

            {selectedDatabase && selectedDatabase.status === DatabaseStatus.RUNNING && (
              <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  <strong>Database đang chạy:</strong>
                  <br />
                  Database &quot;{selectedDatabase.name}&quot; ({getTypeLabel(selectedDatabase.type)}) đang chạy và sẵn sàng kết nối.
                  <br />
                  <br />
                  Connection details đã được tự động thêm vào Environment Variables section. Bạn có thể xem và chỉnh sửa nếu cần.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {databaseSource === 'managed' && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="db-type">Database Type *</Label>
              <Select value={dbType} onValueChange={(value) => onDbTypeChange(value as 'postgres' | 'mysql' | 'mongodb' | 'redis')}>
                <SelectTrigger id="db-type">
                  <SelectValue placeholder="Select database type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgres">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="mongodb">MongoDB</SelectItem>
                  <SelectItem value="redis">Redis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="db-name">Database Name (optional)</Label>
              <Input
                id="db-name"
                placeholder="Leave empty for auto-generated name"
                value={dbName}
                onChange={(e) => onDbNameChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                If not provided, a name will be auto-generated based on your app name
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="db-username">Username (optional)</Label>
                <Input
                  id="db-username"
                  placeholder="Default: admin"
                  value={dbUsername}
                  onChange={(e) => onDbUsernameChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="db-password">Password (optional)</Label>
                <Input
                  id="db-password"
                  type="password"
                  placeholder="Default: admin123"
                  value={dbPassword}
                  onChange={(e) => onDbPasswordChange(e.target.value)}
                />
              </div>
            </div>

            <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Automatic Setup:</strong> The database will be created automatically and connection details will be injected as environment variables.
                <br />
                <br />
                <strong>You do NOT need to add DATABASE_URL in Environment Variables section.</strong>
                <br />
                <br />
                Auto-injected variables:
                <ul className="list-disc list-inside text-xs mt-1 space-y-0.5">
                  <li><code className="bg-green-100 dark:bg-green-900 px-1 rounded">DATABASE_URL</code></li>
                  <li><code className="bg-green-100 dark:bg-green-900 px-1 rounded">SPRING_DATASOURCE_URL</code> (for Java apps)</li>
                  <li><code className="bg-green-100 dark:bg-green-900 px-1 rounded">MONGO_URI</code> (for MongoDB)</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {databaseSource === 'external' && (
          <div className="space-y-4 pt-4 border-t">
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>📝 Using Your Own Database:</strong>
                <br />
                <br />
                When using an external database, you only need to provide the connection string in the <strong>Environment Variables section</strong>.
                <br />
                <br />
                <strong>Examples:</strong>
                <div className="mt-2 space-y-2 text-xs">
                  <div>
                    <strong>PostgreSQL:</strong>
                    <br />
                    <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded block mt-1">
                      DATABASE_URL=postgresql://user:password@prod-db.com:5432/mydb
                    </code>
                  </div>
                  <div>
                    <strong>MySQL:</strong>
                    <br />
                    <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded block mt-1">
                      DATABASE_URL=mysql://user:password@prod-db.com:3306/mydb
                    </code>
                  </div>
                  <div>
                    <strong>MongoDB:</strong>
                    <br />
                    <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded block mt-1">
                      MONGO_URI=mongodb://user:password@cluster.mongodb.net/mydb
                    </code>
                  </div>
                  <div>
                    <strong>SQL Server:</strong>
                    <br />
                    <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded block mt-1">
                      DATABASE_URL=mssql://user:password@sqlserver.com:1433/mydb
                    </code>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
