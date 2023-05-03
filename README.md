With this library, you can:

* Generate USE embeddings for functions in your Javascript and Python code. The USE embeddings capture the semantic meaning of the functions, allowing you to compare them and find functions that are semantically similar.
* Query the embeddings to find functions that can solve specific tasks. For example applied to Optimus https://github.com/hi-primus/optimus, you could search for functions that perform data processing, outlier detection and +100 data processing functions.
* It is designed to run on the browser

# How it works
* Get functions signatures and docstrings from your code.
You can use:

```
cd python
python extract.py --input path_to_file
``` 

to parse a list of python files or urls.

```
cd javascript
npm run extract
```

* Create USE embeddings for the functions using nodeJS for both python and javascript.

* `npm run create-embeddings` to create the embeddings.

## Use cases 
### Create Optimus Code to process data using NLP 
* Parse docs and functions.
* Create the embeddings.
* Create a plan of what operation should be done over a column to standardize the data using LLM.
* With a list of operations, query the embeddings to get signature of the operations and docstrings.
* Use a LLM with the operations and the docstrings to create the Optimus code.

Below you can find the steps to create the embeddings and the prompts.

## Parse the doc and functions


## Creating the embeddings

To create the embeddings using nodejs run the following code:
`npm run create-embeddings`
They are create using the tensorflow USE(Universal Sentence Encoder). The embeddings are saved in the `embeddings.json`
file.

## Prompt to create the prompt about a data engineer:

We are using https://arxiv.org/abs/2304.11490 to create the prompts.

```
I want to create a prompt like this one:
Scenario: "A long time ago, an explorer mapped a small island. Since then, the water levels rose and only a tiny part of the island is now left above water."

Q: On the explorer's maps, does the island appear to be mostly above water?

A: An explorer mapped an island a long time ago. Then water levels rose. Now only a tiny part of the island is above water. The maps show the island before water levels rose. Therefore, in the map most of the island is above water. So, the answer is: Yes, in the maps, most of the island is above the water.
Scenario: "A volcano erupted on a Caribbean island three months ago. Barren lava rock is all that remains today. Satellite photographs show the island as it was before the eruption."

Q: Do satellite photographs show the island is covered in lava?

A: A volcano erupted three months ago and as a result lava rock is all that reigns today. Since the photograph shows the island before the eruptions, it does not show the island cover in Laval. So, the answer is no, the photographs does not show the island covered in lava.
Scenario: "Amy walked to work today. When George woke up, he saw her car in the drive. Her room was quiet and dark. George knows that when Amy is sick, she lies down in a dark room."

Q: Does George think Amy is sick today?

A:

But the prompt I want to make is for a data engineering that is trying to improve the data quality of a specific column in a dataframes. The operations in the answers should be as specific as possible. For example: convert  to lowercase, replace a with b, split the column, wtc  Can you help?
```

This was user only as reference we heavily edit the response to make it more specific to the data engineering task.

### Final prompt

```
Read the scenario and answer the following question. JUST return a list
Scenario: "A data engineer is working to improve the data quality of a specific column in a dataframe. The column contains a mix of upper and lower case letters, along with some inconsistencies such as spaces and dashes. The engineer wants to standardize the data for better analysis and processing."

Q: After analyzing the data, What are some data cleaning operations the data engineer can perform on the column?
A: Let's think step by step:
1. Convert text to lowercase.
2. Replace spaces with underscores.
3. Remove leading/trailing spaces.
4. Replace dashes with underscores.
5. Split columns based on delimiters.
6. Remove duplicate values.

Scenario: "A data engineer is working with a dataframe containing a column with mixed data types, including numbers, strings, and boolean values. The engineer wants to separate the data into different columns based on their respective data types and filter out any unwanted values for better analysis and processing."
Q: What are some data cleaning and transformation operations the data engineer can perform on the mixed-type column?
A: Let's think step by step:
1. Create separate columns for numbers, strings, and booleans.
2. Convert numeric values consistently.
3. Standardize strings (lowercase, replace spaces).
4. Filter unwanted values (nulls, outliers).
5. Remove the original mixed-type column.

Scenario:
"A data engineer is working with a dataframe containing a column data like:
I have this column data:
lastName
Alvarez$$%!
Ampère
Böhr//((%%
dirac$
Einstein
GALiLEI
Ga%%%uss
H$$$ilbert
KEPLER
M$$ax%%well
Newton
Nöether$
Planck!!!
Hoy&&&le
Hertz
Gilbert###
CURIE
COM%%%pton
Chadwick"

Q: "What are some data cleaning and filtering operations the data engineer can perform to retain only the string values in the column?"
Only return a list with the name of the operations. No return any code. Do not return instruction about loading or saving data.
A:
```

### Raw prompt

```
Read the scenario and answer the following question. JUST return a list
Scenario: "A data engineer is working to improve the data quality of a specific column in a dataframe. The column contains a mix of upper and lower case letters, along with some inconsistencies such as spaces and dashes. The engineer wants to standardize the data for better analysis and processing."

Q: After analyzing the data, What are some data cleaning operations the data engineer can perform on the column?
A: Let's think step by step:
1. Convert text to lowercase.
2. Replace spaces with underscores.
3. Remove leading/trailing spaces.
4. Replace dashes with underscores.
5. Split columns based on delimiters.
6. Remove duplicate values.

Scenario: "A data engineer is working with a dataframe containing a column with mixed data types, including numbers, strings, and boolean values. The engineer wants to separate the data into different columns based on their respective data types and filter out any unwanted values for better analysis and processing."
Q: What are some data cleaning and transformation operations the data engineer can perform on the mixed-type column?
A: Let's think step by step:
1. Create separate columns for numbers, strings, and booleans.
2. Convert numeric values consistently.
3. Standardize strings (lowercase, replace spaces).
4. Filter unwanted values (nulls, outliers).
5. Remove the original mixed-type column.

Scenario:
"A data engineer is working with a dataframe containing a column data like:
I have this column data:

{column_name}
{column_data}

Q: "What are some data cleaning and filtering operations the data engineer can perform to retain only the string values in the column?"
Only return a list with the name of the operations. No return any code. Do not return instruction about loading or saving data.
A:
```

## Loading the embeddings and search from the list of operations

in load.html you can find a example of how to load the embeddings an make a question.
With the embedding loaded and the list of operations, get the function signatures to create the prompt of the operations
returned by the LLM.
Every operation returned by the LLM should be searched in the embeddings.

## Ask the prompt

```
Convert this instructions:
1. Remove special characters from the 'lastName' column.
2. Capitalize the first letter and convert the rest of the letters in the 'lastName' column to lowercase.

to Optimus Code. Below example of the Optimus API
def strip(self, cols="*", chars=None, side="both", output_cols=None) -> 'DataFrameType':
- def remove_special_chars(self, cols="*", output_cols=None) -> 'DataFrameType'
- def capitalize(self, cols="*", output_cols=None) -> 'DataFrameType':

Only return the python code. No further explanation is required

This prompt you should return the code to do the Optimus operations.
```

### Raw prompt

```
Convert this instructions:

{instructions_from_llm}

to Optimus Code. Below example of the Optimus API
def strip(self, cols="*", chars=None, side="both", output_cols=None) -> 'DataFrameType':

{return_from_the_embeddings}

Only return the python code. No further explanation is required
This prompt you should return the code to do the Optimus operations.
```
