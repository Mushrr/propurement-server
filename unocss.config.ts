import { defineConfig } from 'unocss'


export default defineConfig({
    theme: {
    },
    shortcuts: {

    },
    rules: [
        [/^text-(\d)px$/, ([,d]) => ({
            fontSize: `${d}px`
        })],
        [/^backdrop-shadow-(\d),(\d),(\d),(.*)$/, ([,d1,d2,d3,d4]) => ({
            "backdrop-filter": `drop-shadow(${d1}px ${d2}px ${d3}px ${d4})`
        })],
        [/^line-height-(\d)(\w+)$/, ([,d,w]) => ({
            "line-height": `${d}${w}`
        })]
    ],
    preflights: [
        {
            getCSS: ({ theme }) => `
                * {
                    padding: 0;
                    margin: 0;
                }
            `
        }
    ]
})