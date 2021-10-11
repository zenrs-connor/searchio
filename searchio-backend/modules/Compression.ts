import * as LZ from 'lzutf8';

export function compress(obj: any): string {
    return LZ.compress(JSON.stringify(obj), { outputEncoding: 'StorageBinaryString' })
}

export function decompress(blob: string): any {
    return JSON.parse(LZ.decompress(blob, { inputEncoding: 'StorageBinaryString' }))
}
