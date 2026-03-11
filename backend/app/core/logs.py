import os

def get_last_n_lines(file_path: str, n: int = 100) -> str:
    """Reads the last N lines from a file efficiently."""
    if not os.path.exists(file_path):
        return f"Log file not found: {file_path}"
    
    try:
        with open(file_path, 'rb') as f:
            f.seek(0, os.SEEK_END)
            buffer = bytearray()
            pointer = f.tell()
            lines_found = 0
            
            while pointer > 0 and lines_found <= n:
                pointer -= 1
                f.seek(pointer)
                char = f.read(1)
                if char == b'\n':
                    lines_found += 1
                buffer.extend(char)
            
            return buffer[::-1].decode('utf-8', errors='ignore')
    except Exception as e:
        return f"Error reading logs: {e}"
