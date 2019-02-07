var api_studentGroup = {
  groupStudent: function (batch_name) {
    return post_query(
       '/studentGroup/groupStudent',
      { batch_name: batch_name }
    )
  },
}
 