import createBrowserHistory from 'history/createBrowserHistory';

const publicPath = __webpack_public_path__;
const { length: publicPathLength } = publicPath;
const basename = /.*\/$/.test(publicPath)
    ? publicPath.slice(0, publicPathLength - 1)
    : publicPath;

export default createBrowserHistory({
    basename
});
