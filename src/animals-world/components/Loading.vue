<template>
  <div :class="$style.wrap">
    <ul :class="$style.loading">
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
    </ul>
    <p :class="$style.text">{{text || 'Loading...'}}</p>
  </div>
</template>

<script>
export default {
  name: 'ComponentLoading',
  props: ['text']
}
</script>

<style module>
.wrap {
  position: fixed;
  top: 0;
  z-index: 12;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.loading {
  display: flex;

  li {
    width: 20rpx;
    height: 20rpx;
    margin-right: 10rpx;
    border-radius: 50%;
    background-color: #4b9cdb;
    animation: loading 2s ease infinite;

    &:nth-child(2) {
      animation-delay: .15s;
    }

    &:nth-child(3) {
      animation-delay: .30s;
    }

    &:nth-child(4) {
      animation-delay: .45s;
    }

    &:nth-child(5) {
      animation-delay: .60s;
    }
  }
}

.text {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #666;
}

@keyframes loading {
  0% {
    transform: translateY(0);
  }

  35% {
    transform: translateY(0);
    opacity: .3;
  }

  50% {
    transform: translateY(-20rpx);
    opacity: .8;
  }

  70% {
    transform: translateY(3rpx);
    opacity: .8;
  }

  85% {
    transform: translateY(-3rpx);
  }
}
</style>
