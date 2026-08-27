/* =========================================================
   CURRENT USER
   ========================================================= */

app.get("/api/me", (req, res) => {

  const lineUserId =
    req.headers["x-line-user-id"];


  /*
    ต้องมี LINE USER ID
  */

  if (!lineUserId) {

    return res.status(401).json({

      ok: false,

      error:
        "LINE User ID is required"

    });

  }


  /*
    ข้อมูลผู้เล่น
    ตอนนี้เป็น Mock Data
    ภายหลังเปลี่ยนเป็น Database ได้
  */

  const user = {

    lineUserId,

    displayName:
      "สมาชิก ROCK YOUR BODY",

    pictureUrl:
      "",

    rockCoin:
      1250,

    energy:
      150,

    maxEnergy:
      200,

    points:
      12560,

    rank:
      12,

    weight:
      78.5,

    targetWeight:
      72.0,

    steps:
      6842,

    targetSteps:
      10000,

    calories:
      320,

    targetCalories:
      500,

    sleep:
      7.3,

    targetSleep:
      8,

    healthScore:
      85,

    inbodyScore:
      72,

    programDay:
      45,

    programTotalDays:
      90

  };


  res.json({

    ok: true,

    user

  });

});
