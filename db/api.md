获取关注者数量前10的用户  db.users.find({"isOrg": false}).sort({"followerCount":-1}).limit(10)

获取关注者数量前10的机构  db.users.find({"isOrg": true}).sort({"followerCount":-1}).limit(10)

获取回答问题数量前10的用户  db.users.find({"isOrg": false}).sort({"answerCount":-1}).limit(10)

统计用户性别       db.users.aggregate([{$match: {gender: {$exists: true}}},{$group: {_id:"$gender", "total": {$sum:1}}}])


获取



## Live

获取参与人数前10的live：db.lives.find().sort({"seats": -1}).limit(10)

获取评价人数前10的live：db.lives.find().sort({"reviewCount": -1}).limit(10)

获取价格最贵的前10的live：db.lives.find().sort({"fee":-1}).limit(10)

获取举办live数前10的用户： db.lives.aggregate([{$group: {_id:"$speaker","liveTotal":{$sum:1}}}])