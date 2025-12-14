/**
 * Utility functions to validate host addresses
 * Checks for private hosts, localhost, and RFC1918 private IPs
 */

export function isPrivateHost(host: string | null | undefined): boolean {
  if (!host) {
    return true;
  }

  const normalizedHost = host.toLowerCase().trim();

  if (normalizedHost === 'host.docker.internal') {
    return true;
  }

  if (
    normalizedHost === 'localhost' ||
    normalizedHost === '127.0.0.1' ||
    normalizedHost === '::1' ||
    normalizedHost === '[::1]'
  ) {
    return true;
  }

  const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = normalizedHost.match(ipPattern);

  if (match) {
    const octet1 = parseInt(match[1], 10);
    const octet2 = parseInt(match[2], 10);
    const octet3 = parseInt(match[3], 10);
    const octet4 = parseInt(match[4], 10);

    if (
      octet1 > 255 ||
      octet2 > 255 ||
      octet3 > 255 ||
      octet4 > 255
    ) {
      return false;
    }

    if (octet1 === 10) {
      return true;
    }

    if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) {
      return true;
    }

    if (octet1 === 192 && octet2 === 168) {
      return true;
    }
  }

  return false;
}

export function isDockerInternalHost(host: string | null | undefined): boolean {
  if (!host) {
    return false;
  }
  return host.toLowerCase().trim() === 'host.docker.internal';
}

export function isLocalOrPrivateHost(host: string | null | undefined): boolean {
  if (!host) {
    return false;
  }
  
  if (isDockerInternalHost(host)) {
    return false;
  }
  
  return isPrivateHost(host);
}

export function isValidExternalHost(host: string | null | undefined): boolean {
  if (!host) {
    return false;
  }

  return !isPrivateHost(host);
}

export function getHostWarningMessage(host: string | null | undefined): string | null {
  if (!host) {
    return "Server chưa được cấu hình public hostname/IP. Không thể kết nối từ máy của bạn.";
  }
  
  if (isDockerInternalHost(host)) {
    return "Server chưa được cấu hình public hostname/IP. Không thể kết nối từ máy của bạn.";
  }
  
  if (isLocalOrPrivateHost(host)) {
    return "Chỉ hoạt động khi server và client cùng máy/cùng network. Để kết nối từ xa, cần cấu hình public hostname/IP.";
  }
  
  return null;
}

