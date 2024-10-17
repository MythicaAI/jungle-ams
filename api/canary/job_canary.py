import logging
import time

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

log = logging.getLogger(__name__)

def main():
    while True:
        print("Hello World!")
        time.sleep(1)

if __name__ == '__main__':
    main()
