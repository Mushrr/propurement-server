// TODO 权限系统
type Privileges = "user_login" | "user_change" | "user_registry" | "user_delete" | "user_fetch" |
                  "propurement_add" | "propurement_delete" | "propurement_change" | "propurement_fetch" |
                  "propurement_user_price" | "propurement_agent_price" | "propurement_admin_price" |
                  "items_add" | "items_delete" | "items_unit_change" | "items_fetch" |
                  "items_state_change" | "items_price_change" | "file"
                  /**
                   * 
                   * 用户下单: 等待状态(waiting)
                   * 管理员分配: 代理处理阶段(waiting)
                   * 代理接受: 代理接受(agent-accept) 此时代理给出自己的报价和单位
                   * 代理拒绝: 代理拒绝(agent-refuse) 代理拒绝之后，订单变成代理拒绝状态，管理员可以查看代理拒绝的理由，随后重新分配为waiting
                   * 配送中: 配送中(delivering) 此时用户可以查看配送信息，并且当货送达的时候，可以挨个点击核对，如果核对之后失败则用户可以拒绝
                   * 用户拒绝状态：用户拒绝状态(user_refuse) 此时管理员可以看到用户已经拒绝了，此时可以由管理员重新下单，然后重新走整个流程. 而此订单作废
                   * 配送完成(用户接受): 用户点击接收了，或者状态改为finished的时候都可以认为此订单有效，例外情况只有免配送订单，只是用来做账的。
                  */