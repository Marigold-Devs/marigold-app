import argparse, sys, os, time

if __name__ == '__main__':
  start = time.time()
  parser = argparse.ArgumentParser()
  parser.add_argument('--destination', help='Destination of deployment (production | beta | staging | dev | alpha)')

  args = parser.parse_args()
  destination = args.destination

  print('1. Building...')
  os.system('npm run build')
  print('DONE\n')

  print('2. Deploying to App Engine...')
  os.system('gcloud app deploy --quiet')
  print('DONE\n')

  print('3. Opening site...')
  os.system('gcloud app browse')
  print('DONE\n')

  end = time.time()
  print('DEPLOYMENT DONE\n')
  print("Finished in: %s seconds" % str(end-start))
