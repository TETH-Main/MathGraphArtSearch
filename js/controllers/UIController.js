/**
 * UI表示と操作を担当するコントローラークラス
 */
class UIController {
    /**
     * UIControllerのコンストラクタ
     * @param {DataService} dataService - データサービス
     * @param {SearchController} searchController - 検索コントローラー
     */
    constructor(dataService, searchController) {
        this.dataService = dataService;
        this.searchController = searchController;

        // DOM要素
        this.elements = {
            keywordSearch: document.getElementById('keyword-search'),
            tagContainer: document.getElementById('tag-container'),
            dateFilter: document.getElementById('date-filter'),
            episodeFilter: document.getElementById('episode-filter'),
            commandInput: document.getElementById('command-input'),
            secretVideos: document.getElementById('secret-videos'),
            secretVideoList: document.getElementById('secret-video-list'),
            videoGrid: document.getElementById('video-grid'),
            loading: document.getElementById('loading'),
            tagCloud: document.getElementById('tag-cloud'),
            sortSelect: document.getElementById('sort-select'),
        };
    }

    /**
     * タグを表示
     */
    renderTags() {
        this.elements.tagContainer.innerHTML = '';

        const allTags = this.dataService.getAllTags();
        const selectedTags = this.searchController.getSelectedTags();

        allTags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag';
            tagElement.textContent = tag;

            if (selectedTags.includes(tag)) {
                tagElement.classList.add('selected');
            }

            tagElement.addEventListener('click', () => {
                this.searchController.toggleTag(tag);
                this.renderTags();

                // 検索結果を即時更新するための追加コード
                const filteredVideos = this.searchController.getFilteredVideos();
                const paginationController = window.app.paginationController;
                const startIndex = paginationController.getStartIndex();
                const endIndex = paginationController.getEndIndex();
                this.renderVideos(filteredVideos, startIndex, endIndex);
                paginationController.updatePagination();
            });

            this.elements.tagContainer.appendChild(tagElement);
        });
    }

    /**
     * 動画を表示
     * @param {Array} videos - 表示する動画の配列
     * @param {number} startIndex - 開始インデックス
     * @param {number} endIndex - 終了インデックス
     */
    renderVideos(videos, startIndex, endIndex) {
        this.elements.videoGrid.innerHTML = '';

        const videosToShow = videos.slice(startIndex, endIndex);

        if (videosToShow.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = '<p>検索結果がありません。検索条件を変更してください。</p>';
            this.elements.videoGrid.appendChild(noResults);
            return;
        }

        videosToShow.forEach(video => {
            const videoCard = this.createVideoCard(video);
            this.elements.videoGrid.appendChild(videoCard);
        });
    }

    /**
     * 動画カードを作成
     * @param {Video} video - 動画オブジェクト
     * @returns {HTMLElement} 動画カード要素
     */
    createVideoCard(video) {
        const card = document.createElement('div');
        card.className = 'video-card';

        const thumbLink = document.createElement('a');
        thumbLink.href = video.getVideoUrl();
        thumbLink.target = '_blank';

        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail';

        const img = document.createElement('img');
        img.src = video.getThumbnailUrl();
        img.alt = video.title;

        const duration = document.createElement('div');
        duration.className = 'duration';
        duration.textContent = video.duration;

        thumbnail.appendChild(img);
        thumbnail.appendChild(duration);
        thumbLink.appendChild(thumbnail);

        const videoInfo = document.createElement('div');
        videoInfo.className = 'video-info';

        const titleLink = document.createElement('a');
        titleLink.href = video.getVideoUrl();
        titleLink.target = '_blank';

        const title = document.createElement('div');
        title.className = 'video-title';
        title.textContent = video.title;

        titleLink.appendChild(title);

        const description = document.createElement('div');
        description.className = 'video-description';
        description.textContent = video.description;

        const meta = document.createElement('div');
        meta.className = 'video-meta';

        const date = document.createElement('div');
        date.textContent = DateUtils.formatDate(video.date);

        const episode = document.createElement('div');
        episode.textContent = video.episode + "話";

        meta.appendChild(date);
        meta.appendChild(episode);

        const tags = document.createElement('div');
        tags.className = 'video-tags';

        video.tags.forEach(tag => {
            if (!tag) return;

            const tagElement = document.createElement('div');
            tagElement.className = 'video-tag';
            tagElement.textContent = tag;

            tagElement.addEventListener('click', () => {
                if (!this.searchController.getSelectedTags().includes(tag)) {
                    this.searchController.toggleTag(tag);
                    this.renderTags();
                }
            });

            tags.appendChild(tagElement);
        });

        videoInfo.appendChild(titleLink);
        videoInfo.appendChild(description);
        videoInfo.appendChild(meta);
        videoInfo.appendChild(tags);

        card.appendChild(thumbLink);
        card.appendChild(videoInfo);

        return card;
    }

    /**
     * 限定公開動画を表示
     */
    /**
     * 限定公開動画を表示
     */
    showSecretVideos() {
        this.elements.secretVideos.classList.remove('hidden');
        this.elements.secretVideoList.innerHTML = '';

        const secretVideos = this.dataService.getSecretVideos();

        if (secretVideos.length === 0) {
            const noVideos = document.createElement('p');
            noVideos.textContent = '限定公開動画はありません。';
            this.elements.secretVideoList.appendChild(noVideos);
            return;
        }

        // 表を作成
        const table = document.createElement('table');
        table.className = 'secret-videos-table';

        // ヘッダー行を作成
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        const headers = ['話数', 'タイトル', '説明'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // テーブル本体を作成
        const tbody = document.createElement('tbody');

        secretVideos.forEach(video => {
            const row = document.createElement('tr');

            // 話数セル
            const episodeCell = document.createElement('td');
            episodeCell.textContent = video.episode || '-';
            row.appendChild(episodeCell);

            // タイトルセル
            const titleCell = document.createElement('td');
            titleCell.textContent = video.title || '-';
            row.appendChild(titleCell);

            // 説明セル
            const descriptionCell = document.createElement('td');
            descriptionCell.textContent = video.description || '-';
            row.appendChild(descriptionCell);

            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        this.elements.secretVideoList.appendChild(table);
    }

    /**
     * ローディング表示の切り替え
     * @param {boolean} isLoading - ローディング中かどうか
     */
    toggleLoading(isLoading) {
        if (isLoading) {
            this.elements.loading.classList.remove('hidden');
        } else {
            this.elements.loading.classList.add('hidden');
        }
    }
}
