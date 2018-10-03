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
      <ul :class="$style.user">
        <li v-for="(user, key) in users" :key="key" :class="selectedUserId === user.id && $style.userActive" @click="handleSelectUser(user.id)">{{user.name + (id === user.id ? '（我）' : '')}} <span>{{user.id}}</span></li>
      </ul>
      <div :class="$style.btn" @click="handleCompare">{{!isAccepted ? '开始比拼' : '回应挑战'}}</div>
      <div :class="$style.info">
        <p>我的星星：<span>{{userInfo.star}}</span>颗</p>
        <p>石头总数：<span>{{totalInfo.stone}}</span>张</p>
        <p>剪刀总数：<span>{{totalInfo.scissors}}</span>张</p>
        <p>布总数：<span>{{totalInfo.paper}}</span>张</p>
      </div>
    </div>
    <Loading v-else text="连接中..." />
  </div>
</template>

<script>
import request from '@/common/request'

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
      compareIndex: -1,
      isAccepted: false
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
      this.selectedUserId = id
    },
    handleCompare () {
      if (!this.selectedCard) {
        window.alert('请挑选卡牌')
        return
      }

      if (this.isAccepted) {
        this.socket.send({
          type: 'accept',
          index: this.compareIndex,
          confirm: true,
          card: this.selectedCard
        })

        this.compareIndex = -1
        this.isAccepted = false
        return
      }

      if (!this.selectedUserId) {
        window.alert('请挑选对手')
        return
      }

      this.socket.send({
        type: 'compare',
        fromId: this.id,
        toId: this.selectedUserId,
        fromCard: this.selectedCard
      })
    },
    onOpen () {
      this.socket.on('open', (id, users) => {
        // let name = window.prompt('请输入姓名')
        let name

        if (!name || !name.trim()) {
          name = id
        }

        this.id = id

        users[id].name = name
        this.users = users

        // 已连接
        this.isConnected = true

        this.socket.send({
          type: 'addUser',
          name
        })
      })
    },
    onClose () {
      this.socket.on('close', users => {
        this.users = users
      })
    },
    onAccept () {
      this.socket.on('isAccept', ({ from, to }, index) => {
        if (to.id !== this.id) return

        let isConfirm = window.confirm('是否接受来自【' + from.name + '】的挑战？')

        if (isConfirm) {
          this.compareIndex = index
          this.isAccepted = true
        } else {
          this.socket.send({
            type: 'accept',
            index,
            confirm: false
          })
        }
      })
    },
    onRefuse () {
      this.socket.on('refuse', user => {
        if (user.id !== this.id) return

        window.alert('用户【' + user.name + '】拒绝了您的挑战')
      })
    },
    onResult () {
      this.socket.on('result', (data, users) => {
        this.users = users

        if (data.fromId === this.id) {
          if (data.result === 1) {
            window.alert('恭喜你赢了！')
          } else if (data.result === 0) {
            window.alert('平局，加油哦')
          } else {
            window.alert('很遗憾你输了')
          }
        } else if (data.toId === this.id) {
          if (data.result === -1) {
            window.alert('恭喜你赢了！')
          } else if (data.result === 0) {
            window.alert('平局，加油哦')
          } else {
            window.alert('很遗憾你输了')
          }
        }
      })
    }
  },
  created () {
    request({
      url: '/api/info'
    }).then(data => {
      this.socket = window.io.connect('http://' + data.ip + ':' + data.port)

      this.onOpen()
      this.onClose()
      this.onAccept()
      this.onRefuse()
      this.onResult()
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

  li {
    padding: 20rpx;
    font-size: 28rpx;
    line-height: 42rpx;

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
