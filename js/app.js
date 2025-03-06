/**
 * アプリケーションのメインクラス
 */
class App {
    /**
     * Appのコンストラクタ
     */
    constructor() {
        // 隠しコマンド
        this.secretCommand = "math_graph_art_secret";

        // サービスとコントローラーの初期化
        this.dataService = new DataService();
        this.searchController = new SearchController(this.dataService);
        this.uiController = new UIController(this.dataService, this.searchController);
        this.paginationController = new PaginationController(this.searchController);

        // DOM要素
        this.elements = {
            keywordSearch: document.getElementById('keyword-search'),
            dateFilter: document.getElementById('date-filter'),
            episodeFilter: document.getElementById('episode-filter'),
            commandInput: document.getElementById('command-input'),
            sortSelect: document.getElementById('sort-select')
        };
    }

    /**
     * アプリケーションを初期化
     */
    async init() {
        // イベントリスナーを設定
        this.setupEventListeners();

        // ページネーションを初期化
        this.paginationController.init();

        // URLパラメータを適用
        this.applyUrlParams();

        // データを取得
        this.uiController.toggleLoading(true);
        const success = await this.dataService.fetchData();

        if (success) {
            // タグを表示
            this.uiController.renderTags();
            this.uiController.renderTagCloud();

            // 検索を実行
            this.searchController.search();

            // 動画を表示
            this.renderCurrentPage();
        } else {
            // エラーメッセージを表示
            document.getElementById('loading').innerHTML = 'データの取得に失敗しました。後でもう一度お試しください。';
        }

        this.uiController.toggleLoading(false);
    }

    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // キーワード検索
        this.elements.keywordSearch.addEventListener('input', () => {
            const searchParams = this.searchController.getSearchParams();
            searchParams.keyword = this.elements.keywordSearch.value;
            this.searchController.setSearchParams(searchParams);
            this.searchController.search();
            this.renderCurrentPage();
        });

        // 日付フィルター
        this.elements.dateFilter.addEventListener('change', () => {
            const searchParams = this.searchController.getSearchParams();
            searchParams.dateFilter = this.elements.dateFilter.value;
            this.searchController.setSearchParams(searchParams);
            this.searchController.search();
            this.renderCurrentPage();
        });

        // 話数フィルター
        this.elements.episodeFilter.addEventListener('input', () => {
            const searchParams = this.searchController.getSearchParams();
            searchParams.episodeFilter = this.elements.episodeFilter.value;
            this.searchController.setSearchParams(searchParams);
            this.searchController.search();
            this.renderCurrentPage();
        });

        // 隠しコマンド
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 's') {
                this.elements.commandInput.classList.toggle('hidden');
            }
        });

        this.elements.commandInput.addEventListener('input', (e) => {
            if (this.searchController.validateSecretCommand(e.target.value, this.secretCommand)) {
                this.uiController.showSecretVideos();
            } else {
                document.getElementById('secret-videos').classList.add('hidden');
            }
        });

        // ソート機能
        this.elements.sortSelect.addEventListener('change', () => {
            const sortOption = this.elements.sortSelect.value;
            this.searchController.sort(sortOption);
            this.renderCurrentPage();
        });
    }

    /**
     * URLパラメータを適用
     */
    applyUrlParams() {
        const urlParams = UrlUtils.getSearchParamsFromUrl();

        // 検索パラメータを設定
        this.searchController.setSearchParams(urlParams);

        // UI要素に値を設定
        if (urlParams.keyword) {
            this.elements.keywordSearch.value = urlParams.keyword;
        }

        if (urlParams.dateFilter) {
            this.elements.dateFilter.value = urlParams.dateFilter;
        }

        if (urlParams.episodeFilter) {
            this.elements.episodeFilter.value = urlParams.episodeFilter;
        }

        if (urlParams.sortOption) {
            this.elements.sortSelect.value = urlParams.sortOption;
        }
    }

    /**
     * 現在のページの動画を表示
     */
    renderCurrentPage() {
        const filteredVideos = this.searchController.getFilteredVideos();
        const startIndex = this.paginationController.getStartIndex();
        const endIndex = this.paginationController.getEndIndex();

        this.uiController.renderVideos(filteredVideos, startIndex, endIndex);
        this.paginationController.updatePagination();
    }
}

// アプリケーションの起動
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    window.app = app; // グローバルに app インスタンスを公開
    app.init();
});
