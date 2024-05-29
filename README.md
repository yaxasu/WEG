# World's Easiest Game

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Controls](#controls)

## Introduction

Welcome to the World's "Easiest" Game, an AI-powered game demonstrating the use of genetic algorithms. This game illustrates how AI can evolve and adapt over time by adjusting various parameters.

The AI "learns" to traverse the level using the concepts of natural selection and survival of the fittest. Initially, a single generation of randomly selected AIs attempts the level. The fittest individuals are identified based on their ability to reach the furthest with the fewest moves. Through incremental learning, the number of available moves increases every five generations, allowing the AI to refine its strategies. This process enables the AI to "remember" previous paths and pass on efficient genes to future generations.

> Note: It takes about ~60 generations for the AI to clear the level with default settings.

## Features

- AI-powered gameplay using genetic algorithms
- Adjustable parameters for population size, mutation rate, and evolution speed
- Real-time updates and visualizations of AI progress

## Installation

To run the World's Easiest Game locally, follow these steps:

1. Clone the repository:
    ```sh
    git clone https://github.com/yaxasu/WEG.git
    ```
2. Navigate to the project directory:
    ```sh
    cd WEG
    ```
3. Open the `index.html` file in your preferred web browser.

## Usage

Once you have the game running, you can adjust various parameters to influence the AI's evolution:

- **Population Size**: Change the number of individuals in each generation.
- **Mutation Rate**: Adjust the likelihood of random mutations occurring.
- **Evolution Player Speed**: Control the speed at which the AI plays the game.
- **Moves Increase**: Set how many additional moves the AI gets every few generations.

Experiment with these settings to see how they impact the AI's performance.

## Configuration

The main settings can be adjusted directly in the game interface under the Settings section.

## Controls

- **Population Size**: Use the `+` and `-` buttons to increase or decrease the population size.
- **Mutation Rate**: Use the `1/2` and `x2` buttons to halve or double the mutation rate.
- **Evolution Player Speed**: Use the `+` and `-` buttons to adjust the speed.
- **Moves Increase**: Use the `+` and `-` buttons to adjust the number of moves added every few generations.
