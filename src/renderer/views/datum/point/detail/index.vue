<template>
  <el-scrollbar class="detail-container" wrap-class="scrollbar-wrapper">
    <div class="head-wrapper">
      监测点详情
      <div class="operate">
        <el-button @click="submitPointModel" v-if="edit">保存</el-button>
        <el-button @click="updatePoint" v-else>编辑</el-button>
        <el-button @click="callback">返回</el-button>
      </div>
    </div>
    <div class="title-wrapper">
      <div class="box name">
        <p>{{point.name}}</p>
        <div><el-tag>{{point.typeName}}</el-tag>{{point.deptName}}</div>
      </div>
      <div class="box address">
        <p>位置</p>
        <div>{{point.address}}</div>
      </div>
      <div class="box center">
        <p>坐标</p>
        <div>[{{point.lat}}, {{point.lng}}]</div>
      </div>
      <div class="box warning">
        <p>预警</p>
        <div :class="'level' + pointLevel.level">{{levelName}}</div>
        <div>{{pointLevel.time}}</div>
      </div>
    </div>
    <div class="level-wrapper">
      <div class="title">
        预警统计
        <el-date-picker
          v-model="picker"
          format="yyyy-MM-dd"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="changePicker">
        </el-date-picker>
      </div>
      <div class="chart"><chart :option="optionLine"></chart></div>
    </div>
    <el-form class="info-wrapper" :model="pointModel" :rules="pointRules" ref="infoForm">
      <div class="center">
        <base-map v-model="map" :center="center" :zoom="17" @ready="mapReady"></base-map>
      </div>
      <div class="datum">
        <el-scrollbar v-if="edit" class="photo-wrapper" wrap-class="scrollbar-wrapper">
          <el-upload
                     list-type="picture-card"
                     :action="baseUrl+'/datum/point/photo/upload'"
                     :headers="headers"
                     :data="params"
                     :file-list="photoList"
                     :on-success="inertsPhoto"
                     :before-remove="deletePhoto">
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-scrollbar>
        <el-carousel v-else height="300px">
          <el-carousel-item v-for="(item, index) in photoList" :key="index">
            <img :src="item.url" alt="">
          </el-carousel-item>
        </el-carousel>
      </div>
      <div class="box">
        <h4>监测点概要</h4>
        <el-form-item label="说明">
          <el-input v-if="edit" type="textarea" :autosize="{minRows: 4}" v-model="pointModel.summary"></el-input>
          <div class="info" v-else>{{pointModel.summary}}</div>
        </el-form-item>
      </div>
      <div class="box">
        <h4>地形地貌</h4>
        <el-form-item label="类型">
          <el-input v-if="edit" v-model="pointModel.jsonInfo.type"></el-input>
          <div class="info" v-else>{{pointModel.jsonInfo.type}}</div>
        </el-form-item>
        <el-form-item label="坡度">
          <el-input v-if="edit" v-model="pointModel.jsonInfo.degree"></el-input>
          <div class="info" v-else>{{pointModel.jsonInfo.degree}}</div>
        </el-form-item>
        <el-form-item label="坡高">
          <el-input v-if="edit" v-model="pointModel.jsonInfo.height"></el-input>
          <div class="info" v-else>{{pointModel.jsonInfo.height}}</div>
        </el-form-item>
      </div>
      <div class="box">
        <h4>地层岩性</h4>
        <el-form-item label="岩性">
          <el-input v-if="edit" v-model="pointModel.jsonInfo.lithology"></el-input>
          <div class="info" v-else>{{pointModel.jsonInfo.lithology}}</div>
        </el-form-item>
        <el-form-item label="厚度">
          <el-input v-if="edit" v-model="pointModel.jsonInfo.thickness"></el-input>
          <div class="info" v-else>{{pointModel.jsonInfo.thickness}}</div>
        </el-form-item>
      </div>
      <div class="box">
        <h4>地质构造</h4>
        <el-form-item label="规模">
          <el-input v-if="edit" v-model="pointModel.jsonInfo.scale"></el-input>
          <div class="info" v-else>{{pointModel.jsonInfo.scale}}</div>
        </el-form-item>
      </div>
      <div class="box">
        <h4>水文地质</h4>
        <el-form-item label="土壤含水">
          <el-input v-if="edit" v-model="pointModel.jsonInfo.water"></el-input>
          <div class="info" v-else>{{pointModel.jsonInfo.water}}</div>
        </el-form-item>
        <el-form-item label="周边水系">
          <el-input v-if="edit" v-model="pointModel.jsonInfo.drainage"></el-input>
          <div class="info" v-else>{{pointModel.jsonInfo.drainage}}</div>
        </el-form-item>
      </div>
      <div class="box">
        <h4>工程地质</h4>
        <el-form-item label="房屋建筑">
          <el-input v-if="edit" v-model="pointModel.jsonInfo.building"></el-input>
          <div class="info" v-else>{{pointModel.jsonInfo.building}}</div>
        </el-form-item>
      </div>
      <div class="box">
        <h4>人类工程活动</h4>
        <el-form-item label="人类活动强度">
          <el-input v-if="edit" v-model="pointModel.jsonInfo.activity"></el-input>
          <div class="info" v-else>{{pointModel.jsonInfo.activity}}</div>
        </el-form-item>
      </div>
      <div class="box">
        <h4>成因机制</h4>
        <el-form-item label="地质因素">
          <el-input v-if="edit" v-model="pointModel.jsonInfo.geology"></el-input>
          <div class="info" v-else>{{pointModel.jsonInfo.geology}}</div>
        </el-form-item>
        <el-form-item label="物理因素">
          <el-input v-if="edit" v-model="pointModel.jsonInfo.physical"></el-input>
          <div class="info" v-else>{{pointModel.jsonInfo.type}}</div>
        </el-form-item>
        <el-form-item label="人为因素">
          <el-input v-if="edit" v-model="pointModel.jsonInfo.artificial"></el-input>
          <div class="info" v-else>{{pointModel.jsonInfo.artificial}}</div>
        </el-form-item>
      </div>
      <div class="box">
        <h4>塌陷规模</h4>
        <el-form-item label="直径（m）">
          <el-input v-if="edit" v-model="pointModel.jsonInfo.diameter"></el-input>
          <div class="info" v-else>{{pointModel.jsonInfo.diameter}}</div>
        </el-form-item>
        <el-form-item label="深度（m）">
          <el-input v-if="edit" v-model="pointModel.jsonInfo.depth"></el-input>
          <div class="info" v-else>{{pointModel.jsonInfo.depth}}</div>
        </el-form-item>
        <el-form-item label="塌陷时间">
          <el-input v-if="edit" v-model="pointModel.jsonInfo.collapseTime"></el-input>
          <div class="info" v-else>{{pointModel.jsonInfo.collapseTime}}</div>
        </el-form-item>
        <el-form-item label="影响范围">
          <el-input v-if="edit" v-model="pointModel.jsonInfo.scope"></el-input>
          <div class="info" v-else>{{pointModel.jsonInfo.scope}}</div>
        </el-form-item>
      </div>
      <div class="box">
        <h4>备注</h4>
        <el-form-item>
          <el-input v-if="edit" type="textarea" :autosize="{minRows: 4}" v-model="pointModel.jsonInfo.remark"></el-input>
        </el-form-item>
      </div>
    </el-form>
  </el-scrollbar>
</template>

<script>
import L from 'leaflet'
import BaseMap from '@/components/base-map'
import Chart from '@/components/chart'
import { getToken } from '@/common/utils/auth'
import { getPoint, getPointLevel, getPointPhotoList, getPointLevelList, updatePoint, deletePhoto } from '@/api/datum'

export default {
  props: {
    point: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      baseUrl: process.env.BASE_API,
      picker: [],
      optionLine: null,
      map: null,
      center: [this.point.lat, this.point.lng],
      pointLevel: {},
      edit: false,
      headers: {
        'X-Token': getToken()
      },
      params: {
        pointId: this.point.id
      },
      photoList: [],
      pointModel: {jsonInfo: {}},
      pointRules: {}
    }
  },
  computed: {
    levelName () {
      switch (this.pointLevel.level) {
        case 1:
          return '监测正常'
        case 2:
          return '蓝色预警'
        case 3:
          return '黄色预警'
        case 4:
          return '橙色预警'
        case 5:
          return '红色预警'
        default:
          return ''
      }
    }
  },
  mounted () {
    this._getPointLevelList()
    this._getPointInfo()
  },
  methods: {
    callback () {
      this.$emit('close')
    },
    mapReady () {
      this.renderPoint()
    },
    inertsPhoto () {
      this._getPointPhotoList()
    },
    deletePhoto (file) {
      deletePhoto(file.id).then(() => {
        this._getPointPhotoList()
      })
    },
    updatePoint () {
      this.edit = true
    },
    submitPointModel () {
      this.$refs.infoForm.validate(valid => {
        if (valid) {
          updatePoint(this.pointModel).then(() => {
            this.edit = false
          })
        }
      })
    },
    /** 渲染监测点 */
    renderPoint () {
      let icon = L.icon({iconUrl: `static/svg/coast1.svg`, iconSize: [50, 50], iconAnchor: [25, 50]})
      let marker = L.marker([this.point.lat, this.point.lng], {icon: icon, riseOnHover: true, title: this.point.name}).addTo(this.map)
      marker.on('click', (event) => {
        this.pointVisible = true
      })
    },
    drawLine (xData, yData) {
      this.optionLine = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}'
        },
        xAxis: {
          boundaryGap: false,
          data: xData
        },
        yAxis: {
          show: false,
          min: 1,
          splitLine: {
            show: false
          }
        },
        grid: {
          left: '2%',
          right: '2%',
          bottom: '14%',
          top: '10%',
          containLabel: true
        },
        dataZoom: [{
          startValue: '01-02'
        }, {
          type: 'inside'
        }],
        visualMap: {
          top: 0,
          right: 10,
          orient: 'horizontal',
          pieces: [{
            gt: 0.5,
            lte: 1.5,
            label: '监测正常',
            color: '#67C23A'
          }, {
            gt: 1.5,
            lte: 2.5,
            label: '蓝色预警',
            color: '#409EFF'
          }, {
            gt: 2.5,
            lte: 3.5,
            label: '黄色预警',
            color: '#FFFF00'
          }, {
            gt: 3.5,
            lte: 4.5,
            label: '橙色预警',
            color: '#E6A23C'
          }, {
            gt: 4.5,
            lte: 5.5,
            label: '红色预警',
            color: '#F56C6C'
          }]
        },
        series: {
          name: name,
          type: 'line',
          symbolSize: 10,
          lineStyle: {
            width: 4
          },
          data: yData
        }
      }
    },
    changePicker () {
      this._getPointLevelList()
    },
    _getPointLevelList () {
      let self = this
      function loadLevelList (pointId, start, end, index, xData, yData) {
        index++
        getPointLevelList(pointId, start, end, index).then(res => {
          if (res.data.length > 0) {
            xData = xData.concat(res.data.map(item => {
              return item.time
            }))
            yData = yData.concat(res.data.map(item => {
              return item.level
            }))
            loadLevelList(pointId, start, end, index, xData, yData)
          } else {
            self.drawLine(xData, yData)
          }
        })
      }
      loadLevelList(this.point.id, this.picker[0], this.picker[1], 0, [], [])
    },
    _getPointInfo () {
      getPoint(this.point.id).then(res => {
        this.pointModel = res.data
        if (res.data.jsonInfo) {
          this.pointModel.jsonInfo = JSON.parse(res.data.jsonInfo)
        } else {
          this.pointModel.jsonInfo = {}
        }
      })
      getPointLevel(this.point.id).then(res => {
        if (res.data) {
          this.pointLevel = res.data
        }
      })
      this._getPointPhotoList()
    },
    _getPointPhotoList () {
      getPointPhotoList(this.point.id).then(res => {
        this.photoList = res.data
      })
    }
  },
  components: {
    Chart,
    BaseMap
  }
}
</script>

<style scoped lang="stylus">
.detail-container
  height calc(100vh - 40px)
  background #eee
  border-top 1px solid #eee
  .head-wrapper
    padding 4px 20px
    height 40px
    line-height 30px
    background white
    border-bottom 1px solid #dedede
    .operate
      float right
  .title-wrapper
    display flex
    margin-top 20px
    background white
    border-top 1px solid #dedede
    border-bottom 1px solid #dedede
    .box
      flex 1
      padding-bottom 20px
      border-right 1px solid #dedede
      &:hover
        box-shadow 0px 4px 4px #dedede
      .level1
        color #67C23A
      .level2
        color #409EFF
      .level3
        color #FFFF00
      .level4
        color #E6A23C
      .level5
        color #F56C6C
      p
        color black
        font-size 16px
        font-weight bold
        text-align center
      div
        text-align center
  .level-wrapper
    margin-top 20px
    background white
    border-top 1px solid #dedede
    border-bottom 1px solid #dedede
    &:hover
      box-shadow 0px 4px 4px #dedede
.title
      padding 10px 20px
      color black
      font-size 16px
      font-weight bold
    .chart
      height 300px
  .info-wrapper
    display flex
    flex-wrap wrap
    padding 10px
    .center
      margin 10px
      width 300px
      height 300px
      &:hover
        box-shadow 4px 4px 4px #bbb
    .datum
      flex-grow 1
      margin 10px
      width 450px
      height 300px
      max-width 600px
      background white
      border 1px solid #dedede
      &:hover
        box-shadow 4px 4px 4px #dedede
      .photo-wrapper
        width 100%
        height 100%
    .box
      flex-grow 1
      margin 10px
      padding 0 20px 20px
      width 300px
      background white
      border 1px solid #dedede
      &:hover
        box-shadow 4px 4px 4px #dedede
      h4
        text-align center
      .el-form-item
        color green !important
      .info
        color gray
</style>