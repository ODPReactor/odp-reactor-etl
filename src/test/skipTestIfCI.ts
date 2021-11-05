export function skipTestIfCI(testSuit : ()=>void) {
    if (!process.env.CI_TEST) {
        testSuit()
    } else {
            test.skip('skip CI test', () => {})
    }
}