import Route from 'koa-router'
import { Db } from 'mongodb'
import { validateUser } from '@utils/fetchTools'

const companyTransition = new Route();

companyTransition.get("/", async (ctx, next) => {
  const req = ctx.request.query || {};
  const db = ctx.state.db as Db;
  const itemsCollection = db.collection("items");
  const userValidate = await validateUser(req.openid as string, ctx);
  if (!req.company) {
    ctx.body = {
      code: 500,
      message: "公司名称不能为空"
    }
    return;
  }
  if (userValidate === "admin") {
    const query = {
      '$and': [
        {
          state: {
            '$in': ['waiting', 'agent-accept', 'agent-refuse', 'distributing']
          }
        },
        {
          "openid": req.company
        }
      ]
    }
    if (req.detail) {
      // 取出详细数据
      const itemsCursor = itemsCollection.find(query);
      const itemsData = []
      const transitions = new Set()
      for await (const items of itemsCursor) {
        itemsData.push(items);
        transitions.add(items.transitionId);
      }

      const companyTransitionData: {
        'openid': string,
        'transitions': any[]
      } = {
        'openid': req.company as string,
        'transitions': []
      }

      for (const transition of transitions) {
        const transitionData: {
          'transitionId': string,
          'items': any[]
        } = {
          'transitionId': transition as string,
          'items': []
        }
        for (const item of itemsData) {
          if (item.transitionId === transition) {
            transitionData.items.push(item);
          }
        }
        companyTransitionData.transitions.push(transitionData);
      }

      ctx.body = {
        code: 200,
        message: "获取成功",
        data: companyTransitionData
      }
      return
    }


    const itemsCursor = itemsCollection.find(query);
    const itemsData = new Set<string>();
    for await (const items of itemsCursor) {
      itemsData.add(items.transitionId);
    }
    ctx.body = {
      code: 200,
      message: "获取成功",
      data: Array.from(itemsData)
    }
  } else {
    ctx.body = {
      code: 500,
      message: "权限不足"
    }
  }
})


export default companyTransition;