define(['api/apiobj', 'config/global'], function (api, g) {

  api.studentGroup = {
    groupStudent: function (batch_name) {
      return g.post_query(
        '/studentGroup/groupStudent',
        { batch_name: batch_name }
      )
    },
  }

});