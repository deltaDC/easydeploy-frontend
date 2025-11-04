import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { BuildLogMessage } from "@/types/build-log.type";

interface UseBuildLogWebSocketOptions {
	buildId: string | null;
	enabled?: boolean;
	onMessage?: (log: BuildLogMessage) => void;
	onError?: (error: Event) => void;
	onConnect?: () => void;
	onDisconnect?: () => void;
}

export function useBuildLogWebSocket({
	buildId,
	enabled = true,
	onMessage,
	onError,
	onConnect,
	onDisconnect,
}: UseBuildLogWebSocketOptions) {
	const [isConnected, setIsConnected] = useState(false);
	const clientRef = useRef<Client | null>(null);
	const callbacksRef = useRef({ onMessage, onError, onConnect, onDisconnect });

	useEffect(() => {
		callbacksRef.current = { onMessage, onError, onConnect, onDisconnect };
	}, [onMessage, onError, onConnect, onDisconnect]);

	const getWebSocketUrl = useCallback(() => {
		const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
		const baseUrl = apiBase.replace("/api", "").replace("/v1", "").replace(/\/$/, "");
		const wsUrl = `${baseUrl}/ws`;
		return wsUrl;
	}, []);

	const getAuthToken = useCallback(() => {
		if (typeof window === "undefined") return null;
		const authStorage = localStorage.getItem("auth-storage");
		if (authStorage) {
			try {
				const parsed = JSON.parse(authStorage);
				if (parsed.state?.token) {
					return parsed.state.token;
				}
			} catch (e) {
				console.warn("Failed to parse auth storage:", e);
			}
		}
		return localStorage.getItem("auth_token");
	}, []);

	useEffect(() => {
		if (!buildId || !enabled) {
			if (clientRef.current?.active) {
				clientRef.current.deactivate();
				clientRef.current = null;
				setIsConnected(false);
			}
			return;
		}

		if (clientRef.current?.active) {
			return;
		}

		const wsUrl = getWebSocketUrl();
		const token = getAuthToken();

		console.log("Connecting to WebSocket:", wsUrl);

		const client = new Client({
			webSocketFactory: () => {
				return new SockJS(wsUrl) as any;
			},
			connectHeaders: token
				? {
						Authorization: `Bearer ${token}`,
				  }
				: {},
			reconnectDelay: 5000,
			heartbeatIncoming: 4000,
			heartbeatOutgoing: 4000,
			onConnect: () => {
				setIsConnected(true);
				callbacksRef.current.onConnect?.();

				if (clientRef.current && buildId) {
					clientRef.current.subscribe(
						`/topic/build-logs/${buildId}`,
						(message: IMessage) => {
							try {
								const rawMessage = JSON.parse(message.body);
								// Normalize the message to ensure it has the 'message' field
								const logMessage: BuildLogMessage = {
									buildId: rawMessage.buildId || "",
									applicationId: rawMessage.applicationId || "",
									message: rawMessage.message || rawMessage.content || "",
									logLevel: rawMessage.logLevel || "INFO",
									timestamp: rawMessage.timestamp || new Date().toISOString(),
									logLineNumber: rawMessage.logLineNumber,
								};
								callbacksRef.current.onMessage?.(logMessage);
							} catch (error) {
								console.error("Error parsing log message:", error);
							}
						},
						{
							id: `build-logs-${buildId}`,
						}
					);
				}
			},
			onStompError: (frame) => {
				console.error("STOMP error:", frame);
				setIsConnected(false);
				callbacksRef.current.onError?.(new Event("stomp_error"));
			},
			onWebSocketError: (event) => {
				console.error("WebSocket error:", event);
				setIsConnected(false);
				callbacksRef.current.onError?.(event);
			},
			onDisconnect: () => {
				setIsConnected(false);
				callbacksRef.current.onDisconnect?.();
			},
		});

		clientRef.current = client;
		client.activate();

		return () => {
			if (clientRef.current?.active) {
				clientRef.current.deactivate();
				clientRef.current = null;
				setIsConnected(false);
			}
		};
	}, [buildId, enabled, getWebSocketUrl, getAuthToken]);

	const disconnect = useCallback(() => {
		if (clientRef.current?.active) {
			clientRef.current.deactivate();
			clientRef.current = null;
			setIsConnected(false);
		}
	}, []);

	return {
		isConnected,
		connect: () => {
			if (enabled && buildId && !clientRef.current?.active) {
				const wsUrl = getWebSocketUrl();
				const token = getAuthToken();
				const client = new Client({
					webSocketFactory: () => new SockJS(wsUrl) as any,
					connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
					reconnectDelay: 5000,
					heartbeatIncoming: 4000,
					heartbeatOutgoing: 4000,
					onConnect: () => {
						setIsConnected(true);
						callbacksRef.current.onConnect?.();
						if (clientRef.current && buildId) {
							clientRef.current.subscribe(
								`/topic/build-logs/${buildId}`,
								(message: IMessage) => {
									try {
										const rawMessage = JSON.parse(message.body);
										// Normalize the message to ensure it has the 'message' field
										const logMessage: BuildLogMessage = {
											buildId: rawMessage.buildId || null,
											applicationId: rawMessage.applicationId || "",
											message: rawMessage.message || rawMessage.content || "",
											logLevel: rawMessage.logLevel || "INFO",
											timestamp: rawMessage.timestamp || new Date().toISOString(),
											logLineNumber: rawMessage.logLineNumber,
										};
										callbacksRef.current.onMessage?.(logMessage);
									} catch (error) {
										console.error("Error parsing log message:", error);
									}
								},
								{ id: `build-logs-${buildId}` }
							);
						}
					},
					onStompError: (frame) => {
						console.error("STOMP error:", frame);
						setIsConnected(false);
						callbacksRef.current.onError?.(new Event("stomp_error"));
					},
					onWebSocketError: (event) => {
						console.error("WebSocket error:", event);
						setIsConnected(false);
						callbacksRef.current.onError?.(event);
					},
					onDisconnect: () => {
						setIsConnected(false);
						callbacksRef.current.onDisconnect?.();
					},
				});
				clientRef.current = client;
				client.activate();
			}
		},
		disconnect,
	};
}

