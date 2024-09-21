# Pet App
This repository contains the frontend code for my Pet Application created with NextJS, with the backend code located [here](https://github.com/porteken/pet_api)

## What is PET?
The technical definition of the PET or Physiological Equivalent Temperature is a method to measure the air temperature at which, in a typical indoor setting (without wind and solar radiation), the heat budget of the human body is balanced with the same core and skin temperature as under the complex outdoor conditions to be assessed.  In other words, the PET measures thermal comfort based on temperature, humidity, wind speed, solar radiation, and clothing.  Based on this [study](https://bjsm.bmj.com/content/55/15/825), there is evidence to suggest that the PET may do a better job at measuring heat stress than other measures like WBGT and UTCI.

## Purpose of the application
This application shows how PET has changed from 2000 to 2013 in the top 500 largest cities in the United States.

## Home Page
The homepage contains an interactive map of the top 500 largest cities in the US, with the ability to select a city that will pull up a graph of the change of either the average (default) or max Pet values over time, along with a link to view additional graphs. 

## City Page
If you select to get more information about a city, you will see the graph mentioned above, along with an interactive graph that will allow you to compare the PET in 2023 vs a year of your choosing.
