<template>
	<view class="music-head" :style="{color: color}">
		<view v-if="icon" class="music-head-icon" :class="{'music-head-iconblack' : iconblack}">
			<text class="iconfont icon-zuojiantou" @tap="handleToBack"></text> | 
			<text class="iconfont icon-shouye" @tap="handleToHome"></text>
		</view>
		{{title}}
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			};
		},
		props: {
			title: {
				type: String,
				default() {
					return {}
				}
			},
			icon: {
				type: Boolean,
				default() {
					return {}
				}
			},
			color: {
				default() {
					return {}
				}
			},
			iconblack: {
				type: Boolean,
				default() {
					return {}
				}
			},
		},
		methods: {
			//返回按钮事件
			handleToBack() {
				uni.navigateBack()
			},
			//返回首页事件
			handleToHome() {
				uni.navigateTo({
					url: '../../pages/index/index'
				})
			}
		}
	}
</script>

<style lang="less" scoped>
	.music-head {
		width: 100%;
		height: 75px;
		font-size: 16px;
		line-height: 80px;
		text-align: center;
		color: black;
		overflow: hidden; 
		position: relative;
		.music-head-icon {
			position: absolute;
			left: 8px;
			top: 26px;
			width: 90px;
			height: 31px;
			background: rgba(0,0,0,0.4);
			color: white;
			line-height: 31px;
			border-radius: 15px;
			display: flex;
			justify-content: space-evenly;
		}
		.music-head-iconblack {
			color: black;
			border: 1px #eaeaea solid;
			background: white;
		}
	}
</style>
