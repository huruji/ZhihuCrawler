获取关注者数量前10的用户  db.users.find({"isOrg": false}).sort({"followerCount":-1}).limit(10)

获取关注者数量前10的机构  db.users.find({"isOrg": true}).sort({"followerCount":-1}).limit(10)

获取回答问题数量前10的用户  db.users.find({"isOrg": false}).sort({"answerCount":-1}).limit(10)

统计用户性别       db.users.aggregate([$group: {ge}])
