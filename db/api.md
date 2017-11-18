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

获取收益前10的live：db.lives.aggregate({$project: {speaker:"$speaker",subject:"$subject","feeTotal":{$multiply:["$seats","$fee"]}}},{$sort:{"feeTotal":-1}},{$limit:10})

获取收益前10的用户：db.lives.aggregate({$project: {speaker:{url_token:"$speaker.member.url_token",name:"$speaker.member.name"},"totalFee":{$multiply:["$seats","$fee"]}}},{$group:{_id:"$speaker","totalFee": {$sum:"$totalFee"}}},{$sort:{"totalFee":-1}},{$limit:10})

获取所有live的参与人数之和：  db.lives.aggregate({$group: {_id:0,seatsTotal: {$sum: "$seats"}}})

获取所有live的评论人数之和： db.lives.aggregate([{$group: {_id:0,reviewCountTotal: {$sum: "$reviewCount"}}}])

获取所有live的收益之和：db.lives.aggregate({$project: {speaker:"$speaker",totalFee: {$multiply: ["$seats","$fee"]}}},{$group:{_id:0,"totalFee":{$sum:"$totalFee"}}})

获取参与live最多的前10的user： db.users.find().sort({"participatedLiveCount":-1}).limit(10)




