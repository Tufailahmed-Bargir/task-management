import express from "express";
const router = express.Router();
 

router.post("/create", async function (req, res) {
  try {
    // Extract token from authorization header
    const token = req.header("authorization");
    console.log("Token is:", token);

    // Check if token exists and extract it if it's in Bearer format
    if (!token) {
      return res
        .status(401)
        .json({ msg: "You are not authorized to perform this action..." });
    }

    // const actualToken = token.split(' ')[1]; // Get the actual token

    // Verify the token
    const verifyToken = jwt.verify(token, jwtPassword);
    console.log("Verified Token:", verifyToken);

    // If verification is successful, proceed to create a new post
    const { title, desc, status, priority, due_date, description } = req.body;

    const newPost = await prisma.task.create({
      data: {
        title,
        desc,
        status,
        priority,
        description,
        due_date,
      },
    });

    return res.status(200).json({
      msg: "Post created successfully",
      newPost: newPost,
    });
  } catch (e) {
    console.error(e.message);

    // Handle different types of errors
    if (e instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ msg: "Invalid token" });
    } else {
      return res.status(500).json({ msg: "Server error", error: e.message });
    }
  }
});

// get the posts as per the ID
router.get("/posts/:id", async function (req, res) {
  const id = req.params.id;
  console.log("id is: ", id);

  const post = await prisma.posts.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!post) {
    return res.json({
      msg: `post with id ${id} not found or it does not exits`,
    });
  }
  res.status(200).json({
    post,
  });
});

// update post with id
router.put("/posts/:id", async function (req, res) {
  const id = parseInt(req.params.id);

  const post = await prisma.posts.findUnique({
    where: {
      id: id,
    },
  });

  const { newTitle, newDesc } = req.body;

  const updatePost = await prisma.posts.update({
    where: {
      id: id,
    },
    data: {
      title: newTitle,
      desc: newDesc,
    },
  });

  res.json({
    msg: "post updated success",
    updatePost,
  });
});

// deleting a perticular post
router.delete("/posts/:id", async function (req, res) {
  const id = parseInt(req.params.id);

  const deletePost = await prisma.posts.delete({
    where: {
      id: id,
    },
  });

  return res.json({
    msg: "post deleted success",
  });
});

//   to get all the tasks
router.get("/tasks", async function (req, res) {
  const allTasks = await prisma.task.findMany();
  res.json({
    allTasks,
  });
});
