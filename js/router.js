/**
 * URL 参数解析与路由辅助
 */
const Router = (() => {
  /**
   * 获取 URL 查询参数
   * @param {string} name - 参数名
   * @returns {string|null}
   */
  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  /**
   * 跳转到指定页面
   * @param {string} path - 页面路径
   * @param {Object} params - 查询参数
   */
  function navigate(path, params = {}) {
    const search = new URLSearchParams(params).toString();
    const url = search ? `${path}?${search}` : path;
    window.location.href = url;
  }

  return { getQueryParam, navigate };
})();

window.Router = Router;
