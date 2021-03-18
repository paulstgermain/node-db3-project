const { column } = require('../../data/db-config');
const db = require('../../data/db-config');

function find() { // EXERCISE A
  /*
    1A- Study the SQL query below running it in SQLite Studio against `data/schemes.db3`.
    What happens if we change from a LEFT join to an INNER join?

      SELECT
          sc.*,
          count(st.step_id) as number_of_steps
      FROM schemes as sc
      LEFT JOIN steps as st
          ON sc.scheme_id = st.scheme_id
      GROUP BY sc.scheme_id
      ORDER BY sc.scheme_id ASC;

      ANSWER: If we change this query to an inner join, we would not longer have the 'Have Fun' scheme displayed, as it doesn't have any steps and would be discluded.

    2A- When you have a grasp on the query go ahead and build it in Knex.
    Return from this function the resulting dataset.
  */

    return db('schemes')
      .leftJoin('steps', 'schemes.scheme_id', 'steps.scheme_id')
      .column('schemes.scheme_id', 'schemes.scheme_name')
      .count({ number_of_steps: 'steps.step_id' })
      .groupBy('schemes.scheme_id')
      .orderBy('schemes.scheme_id', 'ASC');

      // .count('step_id').as('number_of_steps')
      // .join('steps', 'schemes.scheme_id', '=', 'steps.scheme_id')
      // .groupBy('schemes.scheme_id')
      // .orderBy('schemes.scheme_id')
}

async function findById(scheme_id) { // EXERCISE B
  /*
    1B- Study the SQL query below running it in SQLite Studio against `data/schemes.db3`:

      SELECT
          sc.scheme_name,
          st.*
      FROM schemes as sc
      LEFT JOIN steps as st
          ON sc.scheme_id = st.scheme_id
      WHERE sc.scheme_id = 1
      ORDER BY st.step_number ASC;

    2B- When you have a grasp on the query go ahead and build it in Knex
    making it parametric: instead of a literal `1` you should use `scheme_id`.

    3B- Test in Postman and see that the resulting data does not look like a scheme,
    but more like an array of steps each including scheme information:

      [
        {
          "scheme_id": 1,
          "scheme_name": "World Domination",
          "step_id": 2,
          "step_number": 1,
          "instructions": "solve prime number theory"
        },
        {
          "scheme_id": 1,
          "scheme_name": "World Domination",
          "step_id": 1,
          "step_number": 2,
          "instructions": "crack cyber security"
        },
        // etc
      ]

    4B- Using the array obtained and vanilla JavaScript, create an object with
    the structure below, for the case _when steps exist_ for a given `scheme_id`:

      {
        "scheme_id": 1,
        "scheme_name": "World Domination",
        "steps": [
          {
            "step_id": 2,
            "step_number": 1,
            "instructions": "solve prime number theory"
          },
          {
            "step_id": 1,
            "step_number": 2,
            "instructions": "crack cyber security"
          },
          // etc
        ]
      }

    5B- This is what the result should look like _if there are no steps_ for a `scheme_id`:

      {
        "scheme_id": 7,
        "scheme_name": "Have Fun!",
        "steps": []
      }
  */

      const query = await db('schemes')
        .column('schemes.scheme_id', 'schemes.scheme_name', 'steps.*')
        .leftJoin('steps', 'schemes.scheme_id', 'steps.scheme_id')
        .where('schemes.scheme_id', scheme_id)
        .orderBy('steps.step_number', 'ASC');

      if (query[0].step_id !== null) {
        const scheme = {
          scheme_id: query[0].scheme_id,
          scheme_name: query[0].scheme_name,
          steps: query.map(q => {
            return {
              step_id: q.step_id,
              step_number: q.step_number,
              instructions: q.instructions
            }
          })
        }
        return scheme;
      } else {
        const noSteps = {
          scheme_id: query[0].scheme_id,
          scheme_name: query[0].scheme_name,
          steps: []
        }
        return noSteps;
      }
}

function findSteps(scheme_id) { // EXERCISE C
  /*
    1C- Build a query in Knex that returns the following data.
    The steps should be sorted by step_number, and the array
    should be empty if there are no steps for the scheme:

      [
        {
          "step_id": 5,
          "step_number": 1,
          "instructions": "collect all the sheep in Scotland",
          "scheme_name": "Get Rich Quick"
        },
        {
          "step_id": 4,
          "step_number": 2,
          "instructions": "profit",
          "scheme_name": "Get Rich Quick"
        }
      ]
  */

  return db('schemes')
      .join('steps', 'schemes.scheme_id', 'steps.scheme_id')
      .where('schemes.scheme_id', scheme_id)
      .column('steps.step_id', 'steps.step_number', 'steps.instructions', 'schemes.scheme_name')
      .orderBy('step_number', 'ASC');
}

async function add(scheme) { // EXERCISE D
  /*
    1D- This function creates a new scheme and resolves to _the newly created scheme_.
  */
  const id = await db('schemes').insert(scheme);

  return db('schemes')
    .column('schemes.scheme_id', 'schemes.scheme_name')
    .where('schemes.scheme_id', id);

}

async function addStep(scheme_id, step) { // EXERCISE E
  /*
    1E- This function adds a step to the scheme with the given `scheme_id`
    and resolves to _all the steps_ belonging to the given `scheme_id`,
    including the newly created one.
  */

  const { step_number, instructions } = step;
  await db('steps')
    .insert({
      "step_number": step_number,
      "instructions": instructions,
      "scheme_id": scheme_id
    });

    return findSteps(scheme_id);
}

module.exports = {
  find,
  findById,
  findSteps,
  add,
  addStep,
}
