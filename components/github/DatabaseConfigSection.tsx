"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { Database, Info, AlertCircle, Loader2, Check } from "lucide-react";
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
  embedded?: boolean;
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
  embedded = false,
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
  const databaseOptions = [
    {
      value: 'none' as const,
      label: 'Không sử dụng',
      description: 'Ứng dụng không cần cơ sở dữ liệu',
    },
    {
      value: 'existing' as const,
      label: 'Sử dụng cơ sở dữ liệu hệ thống',
      description: 'Chọn từ các cơ sở dữ liệu đã triển khai của bạn',
    },
    // {
    //   value: 'managed' as const,
    //   label: 'Tạo cơ sở dữ liệu hệ thống mới',
    //   description: 'Tạo mới PostgreSQL, MySQL, MongoDB, Redis',
    // },
    {
      value: 'external' as const,
      label: 'Kết nối cơ sở dữ liệu bên ngoài',
      description: 'AWS RDS, Azure Database, hoặc cơ sở dữ liệu khác',
    },
  ];

  const content = (
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-charcoal mb-4 block">Tùy chọn cơ sở dữ liệu</Label>
          <RadioGroup
            value={databaseSource}
            onValueChange={(value: string) => {
              onDatabaseSourceChange(value as 'none' | 'managed' | 'external' | 'existing');
              if (value !== 'existing') {
                onSelectedDatabaseIdChange(undefined);
                setSelectedDatabase(null);
              }
            }}
          >
            <div className="grid grid-cols-1 gap-3">
              {databaseOptions.map((option) => {
                const isSelected = databaseSource === option.value;
                return (
                  <motion.div
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <label
                      htmlFor={`db-${option.value}`}
                      className={`block cursor-pointer rounded-2xl p-4 border-2 transition-all duration-300 ${
                        isSelected
                          ? 'bg-emerald-50/50 border-emerald-300 shadow-emerald-md'
                          : 'bg-white/70 backdrop-blur-sm border-white/40 hover:border-misty-sage/30 hover:bg-white/80'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0 mt-0.5">
                          <RadioGroupItem
                            value={option.value}
                            id={`db-${option.value}`}
                            className="sr-only"
                          />
                        <div
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500'
                              : 'border-charcoal/30 bg-white/80'
                          }`}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3 text-white" strokeWidth={3} />
                          )}
                        </div>
                        {isSelected && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-emerald-400/30 blur-md -z-10"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.2, opacity: 0.6 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-semibold text-sm ${
                            isSelected ? 'text-emerald-700' : 'text-charcoal'
                          }`}>
                            {option.label}
                          </span>
                        </div>
                        <p className={`text-xs ${
                          isSelected ? 'text-emerald-600' : 'text-charcoal/60'
                        }`}>
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </label>
                </motion.div>
              );
            })}
            </div>
          </RadioGroup>
          </div>

          {databaseSource === 'existing' && (
          <div className="space-y-4 pt-4 border-t border-white/20">
            <div className="space-y-2">
              <Label htmlFor="existing-db" className="text-sm font-medium text-charcoal">Chọn Cơ sở dữ liệu *</Label>
              {loadingDatabases ? (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading databases...</span>
                </div>
              ) : loadingConnectionInfo ? (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang tải thông tin kết nối...</span>
                </div>
              ) : databases.length === 0 ? (
                <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                    Không tìm thấy cơ sở dữ liệu. Vui lòng triển khai một cơ sở dữ liệu trước.
                  </AlertDescription>
                </Alert>
              ) : (
                <Select
                  value={selectedDatabaseId || ''}
                  onValueChange={handleDatabaseSelect}
                >
                  <SelectTrigger id="existing-db" aria-label="Chọn cơ sở dữ liệu đã tồn tại">
                    <SelectValue placeholder="Chọn một cơ sở dữ liệu" />
                  </SelectTrigger>
                  <SelectContent>
                    {runningDatabases.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          Cơ sở dữ liệu đang chạy
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
                          Cơ sở dữ liệu đã dừng
                        </div>
                        {stoppedDatabases.map((db) => (
                          <SelectItem key={db.id} value={db.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{db.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {getTypeLabel(db.type)} {db.version} (Đã dừng)
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
                  Chi tiết kết nối đã được tự động thêm vào phần Biến môi trường. Bạn có thể xem và chỉnh sửa nếu cần.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {databaseSource === 'managed' && (
          <div className="space-y-4 pt-4 border-t border-white/20">
            <div className="space-y-2">
              <Label htmlFor="db-type">Loại cơ sở dữ liệu *</Label>
              <Select value={dbType} onValueChange={(value) => onDbTypeChange(value as 'postgres' | 'mysql' | 'mongodb' | 'redis')}>
                <SelectTrigger id="db-type" aria-label="Chọn loại cơ sở dữ liệu">
                  <SelectValue placeholder="Chọn loại cơ sở dữ liệu" />
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
              <Label htmlFor="db-name">Tên cơ sở dữ liệu (tùy chọn)</Label>
              <Input
                id="db-name"
                placeholder="Để trống để tự động tạo tên"
                value={dbName}
                onChange={(e) => onDbNameChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Nếu không cung cấp, tên sẽ được tự động tạo dựa trên tên ứng dụng của bạn
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="db-username">Tên người dùng (tùy chọn)</Label>
                <Input
                  id="db-username"
                  placeholder="Mặc định: admin"
                  value={dbUsername}
                  onChange={(e) => onDbUsernameChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="db-password">Mật khẩu (tùy chọn)</Label>
                <Input
                  id="db-password"
                  type="password"
                  placeholder="Mặc định: admin123"
                  value={dbPassword}
                  onChange={(e) => onDbPasswordChange(e.target.value)}
                />
              </div>
            </div>

            <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Thiết lập tự động:</strong> Cơ sở dữ liệu sẽ được tạo tự động và chi tiết kết nối sẽ được chèn dưới dạng biến môi trường.
                <br />
                <br />
                <strong>Bạn KHÔNG cần thêm DATABASE_URL trong phần Biến môi trường.</strong>
                <br />
                <br />
                Các biến được tự động chèn:
                <ul className="list-disc list-inside text-xs mt-1 space-y-0.5">
                  <li><code className="bg-green-100 dark:bg-green-900 px-1 rounded">DATABASE_URL</code></li>
                  <li><code className="bg-green-100 dark:bg-green-900 px-1 rounded">SPRING_DATASOURCE_URL</code> (cho ứng dụng Java)</li>
                  <li><code className="bg-green-100 dark:bg-green-900 px-1 rounded">MONGO_URI</code> (cho MongoDB)</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {databaseSource === 'external' && (
          <div className="space-y-4 pt-4 border-t border-white/20">
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>📝 Sử dụng cơ sở dữ liệu của riêng bạn:</strong>
                <br />
                <br />
                Khi sử dụng cơ sở dữ liệu bên ngoài, bạn chỉ cần cung cấp chuỗi kết nối trong <strong>phần Biến môi trường</strong>.
                <br />
                <br />
                <strong>Ví dụ:</strong>
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
      </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl border-2 border-white/50 shadow-inner-glow-soft overflow-hidden relative z-30">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-5 w-5 text-misty-sage" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-charcoal">Cấu hình Cơ sở dữ liệu</h3>
        </div>
        <p className="text-sm text-charcoal/70 mb-6">
          Chọn sử dụng cơ sở dữ liệu được quản lý bởi nền tảng hoặc kết nối cơ sở dữ liệu bên ngoài của riêng bạn
        </p>
        {content}
      </div>
    </div>
  );
}
