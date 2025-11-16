"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Info } from "lucide-react";

interface DatabaseConfigSectionProps {
  databaseSource: 'none' | 'managed' | 'external';
  onDatabaseSourceChange: (source: 'none' | 'managed' | 'external') => void;
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
}: DatabaseConfigSectionProps) {
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
          <RadioGroup value={databaseSource} onValueChange={(value: string) => onDatabaseSourceChange(value as 'none' | 'managed' | 'external')}>
            <div className="flex items-center space-x-2 py-2">
              <RadioGroupItem value="none" id="db-none" />
              <Label htmlFor="db-none" className="font-normal cursor-pointer">
                No Database
              </Label>
            </div>
            <div className="flex items-center space-x-2 py-2">
              <RadioGroupItem value="managed" id="db-managed" />
              <Label htmlFor="db-managed" className="font-normal cursor-pointer">
                Use Platform Database
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
