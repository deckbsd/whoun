# Whoun

This little node js app has been made to know who unfollowed a twitter account WITHOUT using the twitter API.

## Installation

Clone the repository and than simply run :
```bash
$ npm install
```

## Running the code

Without viewing the browser :

```bash
$ node app.js my_twitter_account my_twitter_password twitter_account_i_want_to_check
```

To display the browser during the process, just add v a the end of the command line :

```bash
$ node app.js my_twitter_account my_twitter_password twitter_account_i_want_to_check v
```

You have to run it a first time for the program to create a first list of pseudos. From there the program will start comparing the first list and the new list to find unfollowers. Once finished, the new pseudo list is saved in the pseudo file (the existing one is overrided).

## Be aware of

    * This program is based on the Twitter html source code. So if, in the futur the structure change, there is a possibility that the program will stop working. To avoid that, i didn't use any css class names (This a element that is subject to change often) in the part that extracts the pseudos. But still, it can happen.
    * Sometimes the program may miss loading the good page or make silly things (due to the speed of the internet connections, used cpu ressources, ...). To see what's wrong when navigating, you can use the 'v' command line argument. You can also change the delay in the code to adapt it to your context.