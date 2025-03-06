/**
 * アプリケーションのメインクラス
 */
class App {
    /**
     * Appのコンストラクタ
     */
    constructor() {
        // 隠しコマンド（難読化）
        this.secretCommandHash = "-1b0edb6e"; // SHA-1 ハッシュ値
        this.secretCommandInserted = false;

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
            sortSelect: document.getElementById('sort-select')
        };
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
                if (!this.secretCommandInserted) {
                    this.insertSecretCommandElements();
                } else {
                    // すでに挿入されている場合は表示/非表示を切り替え
                    const commandInput = document.getElementById('command-input');
                    if (commandInput) {
                        commandInput.classList.toggle('hidden');
                    }
                }
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
     * 隠しコマンド関連の要素を動的に挿入
     */
    insertSecretCommandElements() {
        // filter-group 要素を作成
        const filterGroup = document.createElement('div');
        filterGroup.className = 'filter-group';

        // 隠しコマンドラベルを作成
        const commandLabel = document.createElement('label');
        commandLabel.for = 'episode-filter';
        commandLabel.textContent = '関数アートサーバで一番最初に発言したアカウント名';

        // コマンド入力フィールドを作成
        const commandInput = document.createElement('input');
        commandInput.type = 'text';
        commandInput.id = 'command-input';
        commandInput.className = 'command-input';
        commandInput.placeholder = 'コマンドを入力...';

        // 限定公開動画表示エリアを作成
        const secretVideos = document.createElement('div');
        secretVideos.id = 'secret-videos';
        secretVideos.className = 'secret-videos hidden';

        const secretTitle = document.createElement('h3');
        secretTitle.textContent = '限定公開動画';

        const secretVideoList = document.createElement('ul');
        secretVideoList.id = 'secret-video-list';

        secretVideos.appendChild(secretTitle);
        secretVideos.appendChild(secretVideoList);

        // 要素を追加
        filterGroup.appendChild(commandLabel);
        filterGroup.appendChild(commandInput);
        filterGroup.appendChild(secretVideos);

        // 検索セクションに追加
        const searchContainer = document.querySelector('.search-container');
        searchContainer.parentNode.appendChild(filterGroup);

        // UIControllerの要素参照を更新
        this.uiController.updateSecretElements(secretVideos, secretVideoList);

        // コマンド入力イベントリスナーを設定
        commandInput.addEventListener('input', (e) => {
            this.validateSecretCommand(e.target.value);
        });

        this.secretCommandInserted = true;
        this.elements.commandInput = commandInput;
    }

    /**
     * 隠しコマンドを検証
     * @param {string} input - 入力されたコマンド
     */
    validateSecretCommand(input) {
        // SHA-1ハッシュ関数（簡易版）
        const sha1 = (str) => {
            // 注: これは実際のSHA-1ではなく、単純化したハッシュ関数です
            // 実際のアプリケーションでは、より安全なハッシュライブラリを使用してください
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // 32bit整数に変換
            }
            return hash.toString(16);
        };

        // 入力値のハッシュを計算
        const inputHash = sha1(input);

        // 正しいコマンドの場合（実際のハッシュ比較ではなく、特定の入力値をハードコード）
        if (inputHash === this.secretCommandHash) { // 実際のアプリケーションではこの比較を避け、ハッシュのみを使用
            const secretVideos = document.getElementById('secret-videos');
            if (secretVideos) {
                secretVideos.classList.remove('hidden');
                // UIControllerの要素が正しく設定されていることを確認してから呼び出す
                if (this.uiController.elements.secretVideos && this.uiController.elements.secretVideoList) {
                    this.uiController.showSecretVideos();
                }
            }
        } else {
            const secretVideos = document.getElementById('secret-videos');
            if (secretVideos) {
                secretVideos.classList.add('hidden');
            }
        }
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
