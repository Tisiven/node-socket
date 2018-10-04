<template>
  <div id="root" :class="$style.app">
    <div v-if="isConnected">
      <div :class="$style.cardWrap">
        <div :class="$style.cardStone">
          <div :class="[$style.cardLayer, selectedCard === 'stone' && $style.cardLayerActive]" @click="handleSelectCard('stone')">{{userInfo.stone}}</div>
        </div>
        <div :class="$style.cardScissors">
          <div :class="[$style.cardLayer, selectedCard === 'scissors' && $style.cardLayerActive]" @click="handleSelectCard('scissors')">{{userInfo.scissors}}</div>
        </div>
        <div :class="$style.cardPaper">
          <div :class="[$style.cardLayer, selectedCard === 'paper' && $style.cardLayerActive]" @click="handleSelectCard('paper')">{{userInfo.paper}}</div>
        </div>
      </div>
      <ul :class="$style.user" v-if="users[id]">
        <li :class="$style.userSelf" @click="handleSelectUser(id)">
          <p :class="$style.userName">{{users[id].name}}</p>
          <p>星星：{{users[id].star}}</p>
          <p>卡牌：{{users[id].stone + users[id].scissors + users[id].paper}}</p>
        </li>
        <li v-for="(user, key) in users" v-if="key !== id" :key="key" :class="selectedUserId === key && $style.userActive" @click="handleSelectUser(key)">
          <p :class="$style.userName">{{user.name}}</p>
          <p>星星：{{user.star}}</p>
          <p>卡牌：{{user.stone + user.scissors + user.paper}}</p>
        </li>
      </ul>
      <div :class="$style.btn" @click="handleChallenge">{{!acceptChallenge ? '开始比拼' : '回应挑战'}}</div>
      <div :class="$style.info">
        <p>我的星星：<span>{{userInfo.star}}</span>颗</p>
        <p>石头总数：<span>{{totalInfo.stone}}</span>张</p>
        <p>剪刀总数：<span>{{totalInfo.scissors}}</span>张</p>
        <p>布总数：<span>{{totalInfo.paper}}</span>张</p>
      </div>
    </div>
    <Loading v-else text="游戏连接中..." />
  </div>
</template>

<script>
import request from '@/common/request'
import tips from '@axe/tips'
import modal from '@axe/modal'

import Loading from './components/Loading.vue'

/* eslint-disable no-alert */
export default {
  name: 'App',
  components: {
    Loading
  },
  data () {
    return {
      isConnected: false,
      id: '',
      selectedUserId: '',
      selectedCard: '',
      users: {},
      acceptChallenge: false
    }
  },
  computed: {
    userInfo () {
      let user = this.users[this.id] || {}

      return {
        star: user.star || 0,
        stone: user.stone || 0,
        scissors: user.scissors || 0,
        paper: user.paper || 0
      }
    },
    totalInfo () {
      let info = {
        stone: 0,
        scissors: 0,
        paper: 0
      }

      for (let id in this.users) {
        let user = this.users[id]

        info.stone += user.stone || 0
        info.scissors += user.scissors || 0
        info.paper += user.paper || 0
      }

      return info
    }
  },
  methods: {
    handleSelectCard (type) {
      this.selectedCard = type
    },
    handleSelectUser (id) {
      if (this.id === id) {
        tips.show({
          content: '不可以挑战自己哦'
        })
        return
      }

      this.selectedUserId = id
    },
    handleChallenge () {
      if (this.gameover) {
        tips.show({
          content: '游戏已结束，请重新开始'
        })
        return
      }

      if (!this.selectedCard) {
        tips.show({
          content: '请挑选卡牌'
        })
        return
      }

      if (this.users[this.id][this.selectedCard] <= 0) {
        tips.show({
          content: '这类卡牌已耗尽'
        })
        return
      }

      let user = this.users[this.selectedUserId]

      if (!user) {
        tips.show({
          content: '请挑选对手'
        })
        return
      }

      if (user.star <= 0 || (user.stone + user.scissors + user.paper) <= 0) {
        tips.show({
          content: '该用户已不具备对战能力了'
        })
        return
      }

      if (!this.acceptChallenge) {
        this.socket.emit('challenge', {
          fromCard: this.selectedCard,
          toId: this.selectedUserId
        })

        modal.show({
          title: '发起挑战',
          content: '等待对方接受中...',
          confirmText: '取消挑战'
        }, t => {
          if (t === 'confirm') {
            this.socket.emit('cancel_challenge')
          }
        })
      } else {
        this.socket.emit('respond_challenge', {
          accept: true,
          fromId: this.challengeFromUser.id,
          toCard: this.selectedCard
        })

        // 重置记录
        this.acceptChallenge = false
      }
    }
  },
  mounted () {
    request({
      url: '/api/info'
    }).then(data => {
      this.socket = window.io.connect('http://' + data.ip + ':' + data.port)

      this.socket.on('connected', () => {
        let name = window.prompt('请输入您优雅高贵的称呼')

        if (!name || !name.trim()) {
          name = this.socket.id
        }

        this.socket.emit('open', name)

        // 已连接
        this.id = this.socket.id
        this.isConnected = true
      })

      this.socket.on('update_users', users => {
        this.users = users
      })

      this.socket.on('accept_challenge', fromUser => {
        modal.show({
          title: '接受挑战',
          content: '是否接受来自【' + fromUser.name + '】的挑战？',
          confirmText: '接受',
          cancelText: '拒绝'
        }, t => {
          if (t === 'confirm') {
            this.selectedUserId = fromUser.id
            this.acceptChallenge = true
            this.challengeFromUser = fromUser
          } else {
            this.socket.emit('respond_challenge', {
              accept: false,
              fromId: fromUser.id
            })
          }
        })
      })

      this.socket.on('cancel_challenge', () => {
        this.acceptChallenge = false

        modal.hide()
        tips.show({
          content: '对方取消了挑战'
        })
      })

      this.socket.on('result_challenge', (result, users) => {
        this.users = users

        modal.hide()
        tips.show({
          content: result === 0 ? '平局' : (result === 1 ? '你赢了' : '你输了')
        }, () => {
          let user = users[this.id]
          let cardCount = user.stone + user.scissors + user.paper

          if (user.star >= 3 && cardCount <= 0) {
            this.socket.emit('success_challenge')

            modal.show({
              title: '游戏胜利',
              content: '恭喜你获得了胜利！',
              confirmText: '再来一局'
            }, t => {
              if (t === 'confirm') {
                window.location.reload()
              }
            })
          } else if (user.star <= 0 || cardCount <= 0) {
            this.gameover = true

            modal.show({
              title: '游戏结束',
              content: user.star <= 0 ? '你已经没有星星了' : '你已经没有卡牌了',
              confirmText: '重新开始'
            }, t => {
              if (t === 'confirm') {
                window.location.reload()
              }
            })
          }
        })
      })

      this.socket.on('success_challenge', user => {
        window.alert(`恭喜【${user.name}】挑战成功，战绩（${user.star}）颗星`)
      })
    })
  }
}
</script>

<style module>
.app {
  padding: 10rpx;
}

.card {
  &-wrap {
    display: flex;
    justify-content: space-between;
  }

  &-img {
    width: 240rpx;
    height: 240rpx;
    background-repeat: no-repeat;
    background-position: 0 0;
    background-size: 100%;
    border-radius: 50%;
    overflow: hidden;
    position: relative;
  }

  &-stone {
    composes: card-img;
    background-image: url(./images/stone.jpg);
  }

  &-scissors {
    composes: card-img;
    background-image: url(./images/scissors.jpg);
  }

  &-paper {
    composes: card-img;
    background-image: url(./images/paper.jpg);
  }

  &-layer {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 72rpx;
    font-weight: bold;
    color: #fff;

    &-active {
      background-color: rgba(255, 85, 0, .7);
    }
  }
}

.user {
  margin: 20rpx 0;
  border: 1px solid #333;
  border-radius: 10rpx;
  overflow: hidden;

  li {
    padding: 20rpx;
    font-size: 28rpx;
    line-height: 42rpx;
    border-bottom: 1px solid #ccc;
    display: flex;
    align-items: center;
    justify-content: space-between;

    span {
      float: right;
      font-size: 18rpx;
      color: #999;
      line-height: 42rpx;
    }
  }

  &-active {
    background-color: rgba(255, 85, 0, .7);
  }

  &-self {
    background-color: rgba(0, 0, 0, .4);
  }

  &-name {
    width: 320rpx;
    flex-shrink: 0;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}

.btn {
  font-size: 28rpx;
  color: #fff;
  line-height: 3;
  text-align: center;
  border-radius: 10rpx;
  background-color: #f50;
}

.info {
  margin: 20rpx 0;
  padding: 10rpx 20rpx;
  border-radius: 10rpx;
  background-color: #ccc;

  p {
    font-size: 28rpx;

    span {
      margin-right: 10rpx;
      font-size: 36rpx;
      color: #f50;
    }
  }
}
</style>
