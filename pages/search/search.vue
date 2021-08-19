<template>
	<view class="search">
		<musichead title="搜索" :icon="true" :iconblack="true"></musichead>
		<view class="container">
			<scroll-view scroll-y="true">
				<view class="search-search">
					<text class="iconfont icon-fangdajing"></text>
					<input type="text" placeholder="搜索歌曲" v-model="searchWord" @confirm="handleToSearch(searchWord)" @input="handleToSuggest"/>
					<text class="iconfont icon-guanbi" v-show="searchType != 1" @tap="handleToClose"></text>
				</view>
				<block v-if="searchType == 1">
					<view class="search-history">
						<view class="search-history-head">
							<text>历史记录</text>
							<text class="iconfont icon-lajitongshanchu" @tap="handleToClear"></text>
						</view>
						<view class="search-history-list">
							<view  v-for="(item,index) in searchHistory" :key="index" @tap="handleToWord(item)">{{item}}</view>
						</view>
					</view>
					<view class="search-hot">
						<view class="search-hot-head">热搜榜</view>
						<view class="search-hot-item" v-for="(item,index) in searchHot" :key="index" @tap="handleToWord(item.searchWord)">
							<view class="search-hot-top">{{index+1}}</view>
							<view class="search-hot-word">
								<view>
									{{item.searchWord}} <image :src="item.iconUrl" mode="aspectFit"></image>
								</view>
								<view>{{item.content}}</view>
							</view>
							<text class="search-hot-count">{{item.score}}</text>
						</view>
					</view>
				</block>
				
				<block v-else-if="searchType == 2">
					<view class="search-result">
						<view class="search-result-item" v-for="(item,index) in searchList" :key="index" @tap="handleToDetail(item.id)">
							<view class="search-result-word">
								<view>{{item.name}}</view>
								<view>
									<image v-if="item.privilege.flag > 60 && item.privilege.flag < 70" src="../../static/dujia.png" mode=""></image>
									<image v-if="item.privilege.maxbr == 999000" src="../../static/sq.png" mode=""></image>
									{{item.ar[0].name}} - {{item.al.name}}
								</view>
							</view>
							<text class="iconfont icon-bofang"></text>
						</view>
					</view>
				</block>
				
				<block v-else-if="searchType == 3">
					<view class="search-suggest">
						<view class="search-suggest-head">搜索“{{searchWord}}”</view>
						<view class="search-suggest-item" v-for="(item,index) in searchSuggest.songs" :key="index" @tap="handleToWord(item.name)">
							<text class="iconfont icon-fangdajing"></text>{{item.name}}
						</view>
					</view>
				</block>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import musichead from '../../components/musichead/musichead.vue'
	import {request} from '../../network/network.js'
	export default {
		data() {
			return {
				searchHot: [],
				searchWord: '',
				searchHistory: [],
				searchList: [],
				searchSuggest: [],
				searchType: 1
			};
		},
		components: {
			musichead
		},
		onLoad() {
			this.getSearchHot()
			uni.getStorage({
				key: 'searchHistory',
				success: (res) => {
					this.searchHistory = res.data
				}
			})
		},
		methods: {
			//热搜列表
			getSearchHot() {
				request({url: '/search/hot/detail'}).then(res => {
					// console.log(res)
					if(res.data.code == '200') {
						this.searchHot = res.data.data;
					}
				})
			},
			//获取搜索结果
			getSearchList(word) {
				request({url: '/cloudsearch',data:{keywords: word}}).then(res => {
					// console.log(res)
					if(res.data.code == '200') {
						this.searchList = res.data.result.songs;
						this.searchType = 2
					}
				})
			},
			//点击热词进行搜索
			handleToWord(word) {
				this.searchWord = word;
				this.handleToSearch(word)
			},
			// 点击回车键进行一次搜索
			handleToSearch(word) {
				// console.log(word)
				// 使用unshift()方法将获取到的搜索词添加到searchHistory数组的头部
				this.searchHistory.unshift(word);
				// 如遇到相同的搜索关键词则进行去重
				this.searchHistory = [...new Set(this.searchHistory)]
				//保持数组长度在10以内
				if(this.searchHistory.length > 10) {
					this.searchHistory.length = 10;
				}
				uni.setStorage({
					key: 'searchHistory',
					data: this.searchHistory
				})
				this.getSearchList(word)
			},
			// 清除历史记录
			handleToClear() {
				uni.removeStorage({
					key: 'searchHistory',
					success: (res) => {
						this.searchHistory = []
					}
				})
			},
			// 搜索框清除功能
			handleToClose() {
				this.searchWord = '';
				this.searchType = 1;
			},
			// 跳转到播放页
			handleToDetail(id) {
				// console.log(id)
				uni.navigateTo({
					url: '/pages/detail/detail?id=' + id
				});
			},
			//输入框事件
			handleToSuggest(ev) {
				let value = ev.detail.value
				if(!value) {
					this.searchType = 1;
					return
				}
				// 搜索建议,提示
				request({url: '/search/suggest',data:{keywords: value}}).then(res => {
					console.log(res)
					if(res.data.code == '200') {
						this.searchSuggest = res.data.result
						this.searchType = 3;
					}
				})
			}
		}
	}
</script>

<style lang="less" scoped>
	.search-search {
		display: flex;
		align-items: center;
		height: 70rpx;
		margin: 60rpx 30rpx 40rpx 30rpx;
		background: #f7f7f7;
		border-radius: 50rpx;
		text {
			margin: 0 26rpx
		}
		input {
			font-size: 26rpx;
			flex: 1;
		}
	}
	.search-history {
		margin: 0 30rpx 50rpx 30rpx;
		font-size: 26rpx;
		.search-history-head {
			display: flex;
			justify-content: space-between;
			margin-bottom: 36rpx;
		}
		.search-history-list {
			display: flex;
			flex-wrap: wrap;
			view {
				padding: 16rpx 28rpx;
				border-radius: 40rpx;
				margin-right: 30rpx;
				margin-bottom: 30rpx;
				background: #f7f7f7;
			}
		}
	}
	.search-hot {
		margin: 0 30rpx; 
		font-size: 26rpx;
		.search-hot-head {
			margin-bottom: 36rpx;
		}
		.search-hot-item {
			display: flex;
			align-items: center;
			margin-bottom: 58rpx;
			.search-hot-top {
				color: #fb2222;
				width: 60rpx;
				margin-left: 8rpx;
			}
			.search-hot-word {
				flex: 1;
				view:nth-child(1) {
					font-size: 30rpx;
					color: black;
				}
				view:nth-child(2) {
					font-size: 24rpx;
					color: #878787;	
				}
				image {
					width: 48rpx;
					height: 22rpx;
				}
			}
			.search-hot-count {
				color: #878787;
			}
		}
	}
	.search-result {
		border-top: 2rpx #e4e4e4 solid;
		padding: 30rpx;
		.search-result-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 30rpx;
			margin-bottom: 30rpx;
			border-bottom: 2rpx #e4e4e4 solid;
			.search-result-word {
				view:nth-child(1) {
					font-size: 28rpx;
					color: #235790;
					margin-bottom: 12rpx;
				}
				view:nth-child(2) {
					font-size: 20rpx;
					color: #898989;
					image {
						width: 26rpx;
						height: 20rpx;
						margin-right: 10rpx;
					}
				}
			}
			text {
				font-size: 50rpx;
			}
		}
	}
	.search-suggest {
		border-top: 2rpx #e4e4e4 solid;
		padding: 30rpx;
		font-size: 26rpx;
		.search-suggest-head {
			color: #4574a5;
			margin-bottom: 74rpx;
		}
		.search-suggest-item {
			color: #5d5d5d;
			margin-bottom: 74rpx;
			text {
				color: #bdbdbd;
				margin-right: 28rpx;
				position: relative;
				top: 2rpx;
			}
		}
	}
</style>
