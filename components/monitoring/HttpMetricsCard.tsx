"use client";

import { HttpMetrics } from "@/types/monitoring.type";
import { Globe, Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface HttpMetricsCardProps {
  metrics: HttpMetrics;
}

export function HttpMetricsCard({ metrics }: HttpMetricsCardProps) {
  const totalErrors = metrics.clientErrorCount + metrics.serverErrorCount;
  const errorRate = metrics.totalRequests > 0 
    ? ((totalErrors / metrics.totalRequests) * 100).toFixed(2)
    : "0.00";

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">HTTP Requests</h3>
      </div>

      <div className="space-y-4">
        {/* Request Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-700 mb-1">Total Requests</div>
            <div className="text-2xl font-bold text-blue-900">
              {metrics.totalRequests.toLocaleString()}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-purple-700 mb-1">Requests/sec</div>
            <div className="text-2xl font-bold text-purple-900">
              {metrics.requestsPerSecond.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Response Times */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Response Times</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-gray-600">Average</div>
              <div className="font-semibold text-gray-900">
                {(metrics.avgResponseTime * 1000).toFixed(0)} ms
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Maximum</div>
              <div className="font-semibold text-gray-900">
                {(metrics.maxResponseTime * 1000).toFixed(0)} ms
              </div>
            </div>
          </div>
        </div>

        {/* Status Codes */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Status Codes</div>
          <div className="space-y-2">
            {/* Success */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">2xx Success</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {metrics.successCount.toLocaleString()}
                </span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${metrics.totalRequests > 0 ? (metrics.successCount / metrics.totalRequests) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Client Errors */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-gray-700">4xx Client Error</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {metrics.clientErrorCount.toLocaleString()}
                </span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${metrics.totalRequests > 0 ? (metrics.clientErrorCount / metrics.totalRequests) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Server Errors */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-gray-700">5xx Server Error</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {metrics.serverErrorCount.toLocaleString()}
                </span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${metrics.totalRequests > 0 ? (metrics.serverErrorCount / metrics.totalRequests) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error Rate */}
          <div className={`mt-3 p-2 rounded text-sm ${
            parseFloat(errorRate) > 5 ? 'bg-red-50 text-red-800' :
            parseFloat(errorRate) > 1 ? 'bg-yellow-50 text-yellow-800' :
            'bg-green-50 text-green-800'
          }`}>
            Error Rate: <span className="font-semibold">{errorRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
