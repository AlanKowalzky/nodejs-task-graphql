import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
// @ts-ignore
import helper from 'fastify-cli/helper.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const AppPath = join(__dirname, '..', 'dist', 'app.js');
function config() {
    return {};
}
async function build(t) {
    const argv = [AppPath];
    const app = (await helper.build(argv, config()));
    t.teardown(() => app.close());
    return app;
}
export { config, build };
//# sourceMappingURL=helper.js.map