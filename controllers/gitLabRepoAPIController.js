

const home = async (req, res) =>{

    try {
        const response = await axios.get('https://gitlab.com/api/v4/projects', {
          headers: {
            Authorization: `Bearer ${gitLabToken}`,
          },
        });
        res.json(response.data);
      } catch (error) {
        res.status(500).json({ error: 'Error fetching projects' });
      }
}

const check = async (req, res) => {

  console.log(" in check route")
  try {

    res.json(" it is working fine.... ")

  } catch (error){

    res.status(500).json({ error: 'Error fetching projects' });

  }
}


module.exports = {

    home,
    check
}