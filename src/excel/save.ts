import { write, writeFile } from 'xlsx-js-style'

export default function save(book: any, name: string) {
    function downloadExcel() {
        console.log('正在保存')
        // @ts-ignore
        const out = write(book, { bookType: 'xlsx', bookSST: false, type: 'binary' });
        function saveAs(blob: Blob, name: string) {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = name;
            a.click();
        }
        // @ts-ignore
        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }

        /* the saveAs call downloads a file on the local machine */
        saveAs(new Blob([s2ab(out)], { type: "" }), name)
    }
    // downloadExcel();
    console.warn("最后的表格如下", book);
    writeFile(book, name)
}