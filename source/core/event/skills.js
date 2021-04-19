import Valkyrie from "../Valkyrie"
import { Skill } from "../GameInstance"

Valkyrie.on(`skills`, function(data) {
  if (this.hasOwn(data, `items`)) {
    this.skillList.splice(0)
    data.items.forEach(item => this.skillList.push(new Skill(item)))
    this.skillList.sort((a, b) => a.sortValue - b.sortValue)
    // 修改技能列表
    data.items = this.skillList
  }
  if (this.hasOwn(data, `limit`)) {
    this.skillLimit = parseInt(data.limit) || 0
  }
  // 学会新的技能
  if (this.hasOwn(data, `item`)) {
    this.skillList.push(new Skill(data.item))
  }

  if (this.hasOwn(data, `id`)) {
    const index = this.skillList.findIndex(skill => skill.id === data.id)
    if (index !== -1) {
      const skill = this.skillList[index]
      if (this.hasOwn(data, `level`)) {
        skill.level = Number(data.level) || 1
        this.onText(`你的技能${ skill.name }提升到了<hiw>${ skill.level }</hiw>级！`)
      }
      if (this.hasOwn(data, `exp`)) {
        // skill.updateExp(data.exp)
        skill._exp = data.exp
        switch (this.state.text) {
          case `练习`:
            this.onText(`你练习${ skill.name }消耗了${ this.lxCost }点潜能。${ data.exp }%`)
            this.state.detail = skill.nameText
            this.score.pot -= this.lxCost
            break
          case `学习`:
            this.onText(`你学习${ skill.name }消耗了${ this.xxCost }点潜能。${ data.exp }%`)
            this.state.detail = skill.nameText
            this.score.pot -= this.xxCost
            break
          case `炼药`:
            this.onText(`你获得了炼药经验，${ skill.name }当前<hiw>${ skill.level }</hiw>级。${ data.exp }%`)
            break
        }
      }
      /* 潜能消耗＝等级平方差×技能颜色系数 */
      const qnCost = (Math.pow(this.skillLimit, 2) - Math.pow(skill.level, 2)) * skill.k
      /* 秒数消耗＝潜能/每一跳的潜能/(每分钟秒数/每分钟五次) */
      const time = qnCost / this.lxCost / ( 60 / 5)
      const timeString = time < 60 ? `${parseInt(time)}分钟` : `${parseInt(time/60)}小时${parseInt(time%60)}分钟`
      // 还需要${ timeString }消耗${ qn }点潜能到${ this.skillLimit }级。
    }
  }

  // 潜能
  if (this.hasOwn(data, `pot`)) {
    this.score.pot = Number(data.pot) || 0
  }
})
