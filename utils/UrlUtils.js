/**
 * URL関連のユーティリティクラス
 */
class UrlUtils {
    /**
     * 検索条件をURLパラメータに反映
     * @param {Object} searchParams - 検索パラメータ
     */
    static updateUrlParams(searchParams) {
        const params = new URLSearchParams();

        if (searchParams.keyword) {
            params.set('q', searchParams.keyword);
        }

        if (searchParams.selectedTags && searchParams.selectedTags.length > 0) {
            params.set('tags', searchParams.selectedTags.join(','));
        }

        if (searchParams.dateFilter) {
            params.set('date', searchParams.dateFilter);
        }

        if (searchParams.episodeFilter) {
            params.set('episode', searchParams.episodeFilter);
        }

        if (searchParams.sortOption && searchParams.sortOption !== 'date-desc') {
            params.set('sort', searchParams.sortOption);
        }

        if (searchParams.itemsPerPage && searchParams.itemsPerPage !== 12) {
            params.set('items', searchParams.itemsPerPage.toString());
        }

        if (searchParams.currentPage && searchParams.currentPage > 1) {
            params.set('page', searchParams.currentPage.toString());
        }

        const newUrl = params.toString()
            ? `${window.location.pathname}?${params.toString()}`
            : window.location.pathname;

        window.history.replaceState({}, '', newUrl);
    }

    /**
     * URLパラメータから検索条件を取得
     * @returns {Object} 検索パラメータ
     */
    static getSearchParamsFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const searchParams = {};

        if (params.has('q')) {
            searchParams.keyword = params.get('q');
        }

        if (params.has('tags')) {
            searchParams.selectedTags = params.get('tags').split(',');
        }

        if (params.has('date')) {
            searchParams.dateFilter = params.get('date');
        }

        if (params.has('episode')) {
            searchParams.episodeFilter = params.get('episode');
        }

        if (params.has('sort')) {
            searchParams.sortOption = params.get('sort');
        }

        if (params.has('items')) {
            searchParams.itemsPerPage = parseInt(params.get('items'));
        }

        if (params.has('page')) {
            searchParams.currentPage = parseInt(params.get('page'));
        }

        return searchParams;
    }
}