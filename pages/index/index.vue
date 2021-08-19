<template>
	<view class="index">
		<musichead title="网易云音乐" :icon="false" :iconblack="false"></musichead>
		<view class="container">
			<scroll-view scroll-y="true" >
				<view class="index-search" @tap="handleToSearch">
					<text class="iconfont icon-fangdajing"></text>
					<input type="text" placeholder="搜索歌曲" />
				</view>
				<view class="index-list">
					<view class="index-list-item" v-for="(item,index) in topList" :key="index" @tap="handleToList(item.id)">
						<view class="index-list-img">
							<image :src="item.coverImgUrl" mode=""></image>
							<text>{{item.updateFrequency}}</text>
						</view>
						<view class="index-list-text">
							<view class="text" v-for="(item1,index1) in item.tracks" :key="index1">{{index1+1}}. {{item1.first}} - {{item1.second}}</view>
						</view>
					</view>
				</view>
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
				topList: [],
				itemId: ''
			}
		},
		components: {
			musichead
		},
		onLoad() {
			this.getTopList();
		},
		methods: {
			//获取所有榜单内容
			getTopList() {
				request({url: '/toplist/detail'}).then(res => {
					// console.log(res)
					this.topList = res.data.list
				})
			},
			//跳转到列表页
			handleToList(idx) {
				uni.navigateTo({
					url: `../list/list?id=`+idx
				})
			},
			//跳转搜索页面
			handleToSearch() {
				uni.navigateTo({
					url: '../search/search'
				})
			}
		}
	}
</script>

<style lang="less" scoped>
	.index {
		.index-search {
			display: flex;
			align-items: center;
			height: 70rpx;
			margin: 60rpx 30rpx 30rpx 30rpx;
			background: #f7f7f7;
			border-radius: 50rpx;
			text {
				font-size: 26rpx;
				margin-right: 26rpx;
				margin-left: 28rpx;
			}
			input {
				font-size: 28rpx;
				flex: 1;
			}
		}
		.index-list {
			margin: 0 30rpx;
			.index-list-item {
				display: flex;
				margin-bottom: 34rpx;
				.index-list-img {
					width: 212rpx;
					height: 212rpx;
					position: relative;
					border-radius: 30rpx;
					overflow: hidden;
					margin-right: 22rpx;
					image {
						width: 100%;
						height: 100%;
					}
					text {
						position: absolute;
						left: 12rpx;
						bottom: 16rpx;
						color: white;
						font-size: 20rpx;
					}
				}
				.index-list-text {
					font-size: 24rpx;
					height: 66rpx;
					width: calc(100% - 212rpx - 22rpx);
					line-height: 66rpx;
					.text {
						text-overflow: ellipsis;
						overflow: hidden;
						white-space: nowrap;
					}
				}
			}
		}
	}
</style>			
				